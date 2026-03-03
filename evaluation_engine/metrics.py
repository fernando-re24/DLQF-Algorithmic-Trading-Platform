"""
Calculate metrics for a trading simulation
Author: Fernando Espinoza
"""
# Import libraries
from sklearn.metrics import classification_report, confusion_matrix
import torch
import pandas as pd
import numpy as np

__all__ = ['Metrics', 'calculate_metrics']

class Metrics:
    def ___init___(self, y, true):
        self.y = y
        self.true = true

    """Compute Series Returns"""
    def series_returns(capital):
            arr = np.asarray(capital, dtype=float)
            if len(arr) < 2 or np.any(arr[:-1] == 0):
                return np.array([])
            return np.diff(arr) / arr[:-1]

    """Compute Max Drawdown"""
    def max_drawdown(capital):
        arr = np.asarray(capital, dtype=float)
        if len(arr) == 0:
            return 0.0
        running_max = np.maximum.accumulate(arr)
        drawdowns = arr / running_max - 1.0
        return drawdowns.min()

    """Compute Sharpe Ratio"""
    def sharpe(r):
        if r.size == 0:
            return 0.0
        std = r.std(ddof=1)
        if std == 0:
            return 0.0
        return (r.mean() / std) * np.sqrt(periods_per_year)

    """Compute sortinto"""
    def sortino(r):
        if r.size == 0:
            return 0.0
        downside = r[r < 0]
        if downside.size == 0:
            return np.inf
        downside_std = downside.std(ddof=1)
        if downside_std == 0:
            return 0.0
        return (r.mean() / downside_std) * np.sqrt(periods_per_year)

    """Compute cagr"""
    def cagr(capital):
        arr = np.asarray(capital, dtype=float)
        if len(arr) < 2 or arr[0] == 0:
            return 0.0
        years = (len(arr) - 1) / periods_per_year
        if years == 0:
            return 0.0
        return (arr[-1] / arr[0]) ** (1 / years) - 1
    
    """
    Compute model performance and portfolio metrics from a capital history series.
    Assumes one observation per bar; annualization uses periods_per_year (default 252 for daily).
    """
    def compute_metrics(self, swings: pd.DataFrame, y: pd.DataFrame, capital_hist: pd.DataFrame, benchmark_capital_hist: pd.DataFrame) -> dict:

        #Compute a classification report and confusion matrix with sklearn
        metrics = {}
        swings_true = np.asarray(swings).squeeze()
        y_pred = np.asarray(y).squeeze()

        model_ret = series_returns(capital_hist)
        bench_ret = series_returns(benchmark_capital_hist)

        excess_ret = model_ret[:len(bench_ret)] - bench_ret[:len(model_ret)]

        metrics = {
            "classification_report": classification_report(swings_true, y_pred, output_dict=True),
            "confusion_matrix" : confusion_matrix(swings_true, y_pred), 
            "cagr": cagr(capital_hist),
            "max_drawdown": max_drawdown(capital_hist),
            "sharpe": sharpe(model_ret),
            "sortino": sortino(model_ret),
            "benchmark_cagr": cagr(benchmark_capital_hist),
            "benchmark_max_drawdown": max_drawdown(benchmark_capital_hist),
            "benchmark_sharpe": sharpe(bench_ret),
            "benchmark_sortino": sortino(bench_ret),
            "excess_sharpe": sharpe(excess_ret),
            "excess_sortino": sortino(excess_ret),
            "return_series": model_ret.tolist(),
            "benchmark_return_series": bench_ret.tolist(),
            "excess_return_series": excess_ret.tolist(),
        }

        return metrics
