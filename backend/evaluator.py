"""
Evaluation pipeline orchestration for a single submission.

Wraps Loader -> Simulator -> Vizualizations into one callable so that
main.py route handlers stay thin.
"""
from __future__ import annotations

import tempfile
from pathlib import Path

import matplotlib
matplotlib.use("Agg")  # headless backend — must be set before any pyplot import

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from evaluation_engine import (
    FeatureScriptError,
    Loader,
    Simulator,
    Vizualizations,
    figure_to_html_report,
)

_INIT_CAPITAL = 100_000.0
_TRADING_COST = 0.05


def run_evaluation(
    model_bytes: bytes,
    csv_bytes: bytes,
    feature_script_bytes: bytes | None,
) -> dict:
    """
    Run the full evaluation pipeline for one submission.

    Returns
    -------
    dict with keys:
        summary       — lightweight metrics dict for the immediate API response
        full_metrics  — complete serializable metrics dict from Simulator
        html_report   — standalone HTML string from figure_to_html_report

    Raises
    ------
    FeatureScriptError  — bad feature script; caller should map to HTTP 422
    ValueError          — malformed model or CSV; caller should map to HTTP 422
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)

        model_path = tmp / "model.pt"
        model_path.write_bytes(model_bytes)

        csv_path = tmp / "data.csv"
        csv_path.write_bytes(csv_bytes)

        feature_script_path: Path | None = None
        if feature_script_bytes is not None:
            feature_script_path = tmp / "feature_script.py"
            feature_script_path.write_bytes(feature_script_bytes)

        try:
            df = pd.read_csv(str(csv_path), parse_dates=["timestamp"])
        except Exception as exc:
            raise ValueError(f"Could not parse CSV: {exc}") from exc

        required_cols = {"timestamp", "Open", "High", "Low", "Close"}
        missing = required_cols - set(df.columns)
        if missing:
            raise ValueError(f"CSV is missing required columns: {missing}")

        loader = Loader(
            model=str(model_path),
            df=df,
            feature_script=str(feature_script_path) if feature_script_path else None,
        )

        try:
            loader.load_model(device="cpu")
        except Exception as exc:
            raise ValueError(f"Failed to load model: {exc}") from exc

        # FeatureScriptError from load_data() propagates up naturally
        timestamps, X, prices, swings = loader.load_data()

        simulator = Simulator(init_capital=_INIT_CAPITAL, trading_cost=_TRADING_COST)
        y, capital_hist, metrics = simulator.run_trading_sim(
            loader.model, loader.device, swings, X, prices
        )

        capital_fig, _ = Vizualizations.capital_hist_comparison(
            capital_hist,
            metrics["buy_and_hold_capital_history"],
            labels=("Model", "Buy & Hold"),
        )
        signals_fig, _ = Vizualizations.signals(swings["prediction"].tolist())

        report_path = tmp / "report.html"
        figure_to_html_report(
            output_path=str(report_path),
            model_metrics=metrics,
            capital_figure=capital_fig,
            signals_figure=signals_fig,
            title="DLQF Evaluation Report",
        )
        html_report = report_path.read_text(encoding="utf-8")

        plt.close(capital_fig)
        plt.close(signals_fig)

        serializable_metrics = _serialize_metrics(metrics)

        summary = {
            "cagr": metrics.get("cagr", 0.0),
            "sharpe": metrics.get("sharpe", 0.0),
            "max_drawdown": metrics.get("max_drawdown", 0.0),
            "total_return": metrics.get("total_return", 0.0),
            "final_value": metrics.get("final_value", 0.0),
            "outperformance_pct": metrics.get("outperformance_pct", 0.0),
        }

        return {
            "summary": summary,
            "full_metrics": serializable_metrics,
            "html_report": html_report,
        }


def _serialize_metrics(metrics: dict) -> dict:
    """Convert numpy ndarrays and scalars to native Python for JSON serialization."""
    out = {}
    for k, v in metrics.items():
        if isinstance(v, np.ndarray):
            out[k] = v.tolist()
        elif isinstance(v, (np.integer, np.floating)):
            out[k] = v.item()
        else:
            out[k] = v
    return out
