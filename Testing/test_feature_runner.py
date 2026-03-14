"""Tests for feature-script runner validation and execution contract."""

from pathlib import Path
from tempfile import TemporaryDirectory

import pandas as pd
import pytest

from evaluation_engine import FeatureScriptError, run_feature_script


def _write_script(tmpdir: Path, body: str) -> str:
    path = tmpdir / "feature_script.py"
    path.write_text(body, encoding="utf-8")
    return str(path)


def _sample_df() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "timestamp": pd.date_range("2025-01-01", periods=5, freq="D"),
            "Open": [1, 1, 1, 1, 1],
            "Close": [1, 2, 3, 2, 4],
            "High": [1, 2, 3, 3, 4],
            "Low": [1, 1, 2, 2, 3],
            "Volume": [10, 11, 12, 13, 14],
        }
    )


def test_missing_feature_function():
    with TemporaryDirectory() as d:
        path = _write_script(Path(d), "def not_features(df):\n    return pd.DataFrame()\n")
        with pytest.raises(FeatureScriptError, match="must define callable 'build_features'"):
            run_feature_script(path, _sample_df())


def test_non_dataframe_output():
    with TemporaryDirectory() as d:
        path = _write_script(
            Path(d),
            "def build_features(df, **kwargs):\n    return []\n",
        )
        with pytest.raises(FeatureScriptError, match="must be a pandas DataFrame"):
            run_feature_script(path, _sample_df())


def test_row_count_mismatch():
    with TemporaryDirectory() as d:
        path = _write_script(
            Path(d),
            "import pandas as pd\n\ndef build_features(df, **kwargs):\n    return pd.DataFrame({'x':[1,2]})\n",
        )
        with pytest.raises(FeatureScriptError, match="row count"):
            run_feature_script(path, _sample_df())


def test_non_numeric_and_nan_strict_and_non_strict():
    with TemporaryDirectory() as d:
        path = _write_script(
            Path(d),
            "import pandas as pd\n\ndef build_features(df, **kwargs):\n    return pd.DataFrame({'a':[1.0,float('nan')], 'b':['x','y']})\n",
        )

        with pytest.raises(FeatureScriptError, match="non-finite values|Non-numeric feature columns"):
            run_feature_script(path, _sample_df(), strict=True)

        meta = {}
        out = run_feature_script(
            path,
            _sample_df(),
            strict=False,
            metadata=meta,
        )
        assert out.shape[0] == len(_sample_df())
        assert meta["row_count"] == len(_sample_df())
        assert len(meta["warnings"]) >= 1


def test_script_args_pass_through_and_timestamps_unchanged():
    with TemporaryDirectory() as d:
        path = _write_script(
            Path(d),
            "import pandas as pd\n\ndef build_features(df, scale=1.0, **kwargs):\n    return pd.DataFrame({'feat': df['Close'] * scale})\n",
        )

        out = run_feature_script(path, _sample_df(), args={"scale": 3})
        expected = _sample_df()["Close"] * 3
        pd.testing.assert_series_equal(out["feat"], expected)
