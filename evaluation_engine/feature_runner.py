"""
Pluggable feature-script execution helpers for evaluator submissions.
"""
from __future__ import annotations

import importlib.util
import logging
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from pathlib import Path
from typing import Any, Dict, Mapping, Optional, Sequence

import numpy as np
import pandas as pd

__all__ = ["FeatureScriptError", "run_feature_script"]

log = logging.getLogger(__name__)


class FeatureScriptError(RuntimeError):
    """Raised when a feature script cannot be loaded, executed, or validated."""


def _build_module_name(script_path: Path) -> str:
    # Unique, deterministic module identifier to avoid collisions.
    return f"feature_script_{abs(hash(script_path.resolve()))}"


def _load_feature_module(script_path: Path):
    spec = importlib.util.spec_from_file_location(_build_module_name(script_path), str(script_path))
    if spec is None or spec.loader is None:
        raise FeatureScriptError(f"Could not load spec for feature script: {script_path}")

    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
    except Exception as exc:
        raise FeatureScriptError(f"Failed to import feature script {script_path}: {exc}") from exc
    return module


def _validate_features(
    features: Any,
    raw_df: pd.DataFrame,
    *,
    strict: bool,
    non_numeric_whitelist: Sequence[str],
) -> tuple[pd.DataFrame, list[str]]:
    warnings: list[str] = []

    if not isinstance(features, pd.DataFrame):
        raise FeatureScriptError(f"Feature script output must be a pandas DataFrame, got: {type(features).__name__}")

    if len(features) != len(raw_df):
        raise FeatureScriptError(
            f"Feature output row count ({len(features)}) does not match input ({len(raw_df)})."
        )

    if features.columns.duplicated().any():
        dupes = features.columns[features.columns.duplicated()].tolist()
        raise FeatureScriptError(f"Feature output contains duplicated columns: {dupes}")

    if isinstance(raw_df.index, pd.DatetimeIndex) and isinstance(features.index, pd.DatetimeIndex):
        if not features.index.is_monotonic_increasing:
            msg = "Feature output index must be monotonic increasing for datetime index inputs."
            if strict:
                raise FeatureScriptError(msg)
            warnings.append(msg)

    whitelist = set(non_numeric_whitelist or ())
    bad_non_numeric = [col for col in features.columns if col not in whitelist and not pd.api.types.is_numeric_dtype(features[col])]
    if bad_non_numeric:
        msg = f"Non-numeric feature columns detected: {bad_non_numeric}"
        if strict:
            raise FeatureScriptError(msg)
        warnings.append(msg)
        numeric_features = [c for c in features.columns if c not in bad_non_numeric]
    else:
        numeric_features = list(features.columns)

    numeric_df = features[numeric_features]
    if not numeric_df.empty:
        if not np.isfinite(numeric_df.to_numpy()).all():
            finite_mask = np.isfinite(numeric_df.to_numpy())
            bad_count = int(numeric_df.size - finite_mask.sum())
            msg = f"Feature output has non-finite values (NaN/inf) in {bad_count} cells."
            if strict:
                raise FeatureScriptError(msg)
            warnings.append(msg)

    return features, warnings


def run_feature_script(
    script_path: str | Path,
    raw_df: pd.DataFrame,
    args: Optional[Mapping[str, Any]] = None,
    *,
    feature_fn: str = "build_features",
    strict: bool = True,
    max_runtime_sec: float = 5,
    non_numeric_whitelist: Sequence[str] | None = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> pd.DataFrame:
    """
    Execute a participant feature script in-process and validate its output.

    Parameters:
        script_path: absolute or relative path to a Python file containing build_features(df, **kwargs)
        raw_df: raw feature frame to pass to the participant feature function
        args: kwargs passed through to the feature function
        feature_fn: callable name inside script (default: build_features)
        strict: if True, validation failures raise FeatureScriptError. if False, continue with warnings
        max_runtime_sec: guardrail timeout for script execution
    """
    if args is not None and not isinstance(args, Mapping):
        raise FeatureScriptError(
            f"feature script args must be a mapping or None, got: {type(args).__name__}"
        )

    path = Path(script_path)
    if not path.exists():
        raise FeatureScriptError(f"Feature script not found: {script_path}")

    start = time.time()
    warnings: list[str] = []

    module = _load_feature_module(path)
    builder = getattr(module, feature_fn, None)
    if not callable(builder):
        raise FeatureScriptError(
            f"Feature script '{path}' must define callable '{feature_fn}(df, **kwargs)'."
        )

    payload = raw_df.copy(deep=True)
    kwargs = dict(args or {})

    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(builder, payload, **kwargs)
            features = future.result(timeout=max_runtime_sec)
    except FuturesTimeoutError as exc:
        raise FeatureScriptError(
            f"Feature script execution exceeded max_runtime_sec={max_runtime_sec}"
        ) from exc
    except Exception as exc:
        raise FeatureScriptError(f"Feature script execution failed: {exc}") from exc

    features, warnings = _validate_features(
        features,
        raw_df,
        strict=strict,
        non_numeric_whitelist=tuple(non_numeric_whitelist or ()),
    )

    elapsed = time.time() - start
    for warning in warnings:
        log.warning("Feature script validation warning: %s", warning)

    if metadata is not None:
        metadata.clear()
        metadata.update(
            {
                "script_path": str(path),
                "feature_fn": feature_fn,
                "elapsed_sec": elapsed,
                "row_count": int(len(features)),
                "feature_count": int(features.shape[1]),
                "warnings": warnings,
            }
        )

    log.info(
        "Feature script %s executed in %.3fs and returned %s features for %s rows.",
        path.name,
        elapsed,
        features.shape[1],
        len(features),
    )

    return features
