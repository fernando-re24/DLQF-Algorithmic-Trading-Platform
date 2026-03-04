"""
Generate visualizations of a trading simulation.
Author: Fernando Espinoza
"""
from __future__ import annotations

from typing import Iterable, Tuple

import matplotlib.pyplot as plt
import pandas as pd

__all__ = [
    "Vizualizations",
    "capital_hist",
    "capital_hist_comparison",
    "signals",
    "signals_comparison",
]

"""
 Normalize incoming data to a pandas Series while preserving existing indexes.
"""
def _as_series(data: pd.DataFrame | pd.Series | Iterable[float], name: str) -> pd.Series:
    \
    if isinstance(data, pd.Series):
        series = data.copy()
    elif isinstance(data, pd.DataFrame):
        if data.shape[1] != 1:
            raise ValueError(f"{name} must have exactly one column")
        series = data.iloc[:, 0].copy()
    else:
        series = pd.Series(list(data))
    if not series.name:
        series.name = name
    return series

"""Utility Method"""
def _new_figure(title: str) -> Tuple[plt.Figure, plt.Axes]:
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.set_title(title)
    ax.grid(True, alpha=0.25, linestyle="--")
    return fig, ax


class Vizualizations:
    """Plot helpers for simulator outputs."""

    """Plot the capital history of a single model run.
    Returns
    -------
    fig, ax : matplotlib Figure and Axes with the line plot.
    """
    @staticmethod
    def capital_hist(hist: pd.DataFrame | pd.Series | Iterable[float]) -> Tuple[plt.Figure, plt.Axes]:

        series = _as_series(hist, "Capital")
        fig, ax = _new_figure("Capital History")
        ax.plot(series.index, series.values, label=series.name, color="#1f77b4")
        ax.set_xlabel("Time")
        ax.set_ylabel("Portfolio Value")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    @staticmethod
    def capital_hist_comparison(
        hist1: pd.DataFrame | pd.Series | Iterable[float],
        hist2: pd.DataFrame | pd.Series | Iterable[float],
        labels: Tuple[str, str] = ("Model", "Benchmark"),
    ) -> Tuple[plt.Figure, plt.Axes]:
        """Plot and compare capital histories of two runs (e.g., model vs. buy-and-hold)."""
        series1 = _as_series(hist1, labels[0])
        series2 = _as_series(hist2, labels[1])
        fig, ax = _new_figure("Capital History Comparison")
        ax.plot(series1.index, series1.values, label=series1.name, color="#1f77b4")
        ax.plot(series2.index, series2.values, label=series2.name, color="#ff7f0e")
        ax.set_xlabel("Time")
        ax.set_ylabel("Portfolio Value")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    @staticmethod
    def signals(swings: pd.DataFrame | pd.Series | Iterable[float]) -> Tuple[plt.Figure, plt.Axes]:
        """Plot swing/position predictions (-1 sell, 0 hold, 1 buy) for one model."""
        series = _as_series(swings, "Signal")
        fig, ax = _new_figure("Model Signals")
        ax.step(series.index, series.values, where="mid", label=series.name, color="#2ca02c")
        ax.set_yticks([-1, 0, 1])
        ax.set_ylabel("Signal")
        ax.set_xlabel("Time")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax

    @staticmethod
    def signals_comparison(
        swings1: pd.DataFrame | pd.Series | Iterable[float],
        swings2: pd.DataFrame | pd.Series | Iterable[float],
        labels: Tuple[str, str] = ("Model", "Benchmark"),
    ) -> Tuple[plt.Figure, plt.Axes]:
        """Plot and compare swing predictions for two runs."""
        series1 = _as_series(swings1, labels[0])
        series2 = _as_series(swings2, labels[1])
        fig, ax = _new_figure("Signal Comparison")
        ax.step(series1.index, series1.values, where="mid", label=series1.name, color="#2ca02c")
        ax.step(series2.index, series2.values, where="mid", label=series2.name, color="#d62728")
        ax.set_yticks([-1, 0, 1])
        ax.set_ylabel("Signal")
        ax.set_xlabel("Time")
        ax.legend(loc="best")
        fig.tight_layout()
        return fig, ax


# Convenience aliases matching __all__ for direct imports
capital_hist = Vizualizations.capital_hist
capital_hist_comparison = Vizualizations.capital_hist_comparison
signals = Vizualizations.signals
signals_comparison = Vizualizations.signals_comparison
