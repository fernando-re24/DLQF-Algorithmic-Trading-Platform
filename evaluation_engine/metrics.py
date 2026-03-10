"""
Calculate metrics for a trading simulation
Author: Fernando Espinoza
"""
# Import libraries
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd
import numpy as np

__all__ = ['Metrics', 'calculate_metrics']

class Metrics:
    """Container for per-run trading metrics."""

    def __init__(self, periods_per_year: float = 252.0):
        self.periods_per_year = periods_per_year

    """Compute Series Returns"""
    @staticmethod
    def series_returns(capital):
            arr = np.asarray(capital, dtype=float)
            if len(arr) < 2 or np.any(arr[:-1] == 0):
                return np.array([])
            return np.divide(
                np.diff(arr),
                arr[:-1],
                out=np.zeros(len(arr) - 1, dtype=float),
                where=(arr[:-1] != 0),
            )

    """Compute Max Drawdown"""
    @staticmethod
    def max_drawdown(capital):
        arr = np.asarray(capital, dtype=float)
        if len(arr) == 0:
            return 0.0
        running_max = np.maximum.accumulate(arr)
        drawdowns = arr / running_max - 1.0
        return drawdowns.min()

    """Compute Sharpe Ratio"""
    @staticmethod
    def sharpe(r, periods_per_year):
        if r.size == 0:
            return 0.0
        std = r.std(ddof=1)
        if std == 0:
            return 0.0
        return (r.mean() / std) * np.sqrt(periods_per_year)

    """Compute sortinto"""
    @staticmethod
    def sortino(r, periods_per_year):
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
    @staticmethod
    def cagr(capital, periods_per_year):
        arr = np.asarray(capital, dtype=float)
        if len(arr) < 2 or arr[0] == 0:
            return 0.0
        years = (len(arr) - 1) / max(periods_per_year, 1e-12)
        if years == 0:
            return 0.0
        return (arr[-1] / arr[0]) ** (1 / years) - 1

    """Compute annualized volatility from per-bar returns."""
    @staticmethod
    def volatility(returns, periods_per_year):
        if returns.size == 0:
            return 0.0
        std = returns.std(ddof=1)
        if np.isnan(std):
            return 0.0
        return std * np.sqrt(periods_per_year)

    """Compute turnover proxy from signal changes."""
    @staticmethod
    def turnover(signals):
        arr = np.asarray(signals, dtype=float).reshape(-1)
        if arr.size < 2:
            return 0.0
        return float(np.mean(np.abs(np.diff(arr))))

    """Compute turn-by-turn trade P/L from capital curve."""
    @staticmethod
    def trade_pls(signals, capital):
        sig = np.asarray(signals).reshape(-1)
        cap = np.asarray(capital, dtype=float).reshape(-1)
        n = min(len(sig), len(cap))
        if n < 2:
            return np.array([])

        sig = sig[:n]
        cap = cap[:n]
        if n < 2:
            return np.array([])

        starts = [0]
        for i in range(1, n):
            if sig[i] != sig[i - 1]:
                starts.append(i)

        ends = [idx - 1 for idx in starts[1:]] + [n - 1]

        trade_pls = []
        for start, end in zip(starts, ends):
            if start == end:
                continue
            if abs(sig[start]) == 0:
                continue
            trade_pls.append(cap[end] - cap[start])
        return np.asarray(trade_pls, dtype=float)

    """Compute average trade P/L."""
    @staticmethod
    def average_trade_pl(signals, capital):
        trade_pls = Metrics.trade_pls(signals, capital)
        if trade_pls.size == 0:
            return 0.0
        return float(np.mean(trade_pls))

    """Compute win rate from trade-level P/L."""
    @staticmethod
    def win_rate(signals, capital):
        trade_pls = Metrics.trade_pls(signals, capital)
        if trade_pls.size == 0:
            return 0.0
        return float((trade_pls > 0).mean())

    """Compute profit factor from trade-level P/L."""
    @staticmethod
    def profit_factor(signals, capital):
        trade_pls = Metrics.trade_pls(signals, capital)
        if trade_pls.size == 0:
            return 0.0
        gross_profit = trade_pls[trade_pls > 0].sum()
        gross_loss = np.abs(trade_pls[trade_pls < 0].sum())
        if gross_loss == 0:
            return np.inf if gross_profit > 0 else 0.0
        return float(gross_profit / gross_loss)
    
    """
    Compute model performance and portfolio metrics from a capital history series.
    Assumes one observation per bar; annualization uses periods_per_year (default 252 for daily).
    """
    def compute_metrics(
        self,
        swings: pd.DataFrame,
        y: pd.DataFrame,
        capital_hist: pd.DataFrame,
        benchmark_capital_hist: pd.DataFrame = None,
        periods_per_year: float = None,
    ) -> dict:
        ppy = periods_per_year if periods_per_year is not None else self.periods_per_year
        #Compute a classification report and confusion matrix with sklearn
        swings_true = np.asarray(swings).squeeze()
        y_pred = np.asarray(y).squeeze()

        min_len = min(len(swings_true), len(y_pred))
        swings_true = swings_true[:min_len]
        y_pred = y_pred[:min_len]
        signal_labels = [-1, 0, 1]

        model_ret = Metrics.series_returns(capital_hist)
        bench_ret = Metrics.series_returns(benchmark_capital_hist) if benchmark_capital_hist is not None else np.array([])

        min_return_len = min(len(model_ret), len(bench_ret))
        excess_ret = (
            model_ret[:min_return_len] - bench_ret[:min_return_len]
            if min_return_len > 0
            else np.array([])
        )

        metrics = {
            "classification_report": classification_report(
                swings_true, y_pred, labels=signal_labels, zero_division=0, output_dict=True
            ),
            "confusion_matrix" : confusion_matrix(swings_true, y_pred, labels=signal_labels), 
            "cagr": Metrics.cagr(capital_hist, ppy),
            "max_drawdown": Metrics.max_drawdown(capital_hist),
            "sharpe": Metrics.sharpe(model_ret, ppy),
            "sortino": Metrics.sortino(model_ret, ppy),
            "volatility": Metrics.volatility(model_ret, ppy),
            "turnover": Metrics.turnover(y_pred),
            "win_rate": Metrics.win_rate(y_pred, capital_hist),
            "average_trade_pl": Metrics.average_trade_pl(y_pred, capital_hist),
            "profit_factor": Metrics.profit_factor(y_pred, capital_hist),
            "return_series": model_ret.tolist(),
            "benchmark_return_series": bench_ret.tolist(),
            "excess_return_series": excess_ret.tolist(),
        }

        if benchmark_capital_hist is not None:
            metrics.update(
                {
                    "benchmark_cagr": Metrics.cagr(benchmark_capital_hist, ppy),
                    "benchmark_max_drawdown": Metrics.max_drawdown(benchmark_capital_hist),
                    "benchmark_sharpe": Metrics.sharpe(bench_ret, ppy),
                    "benchmark_sortino": Metrics.sortino(bench_ret, ppy),
                    "benchmark_volatility": Metrics.volatility(bench_ret, ppy),
                }
            )

        if len(bench_ret) > 0:
            metrics.update(
                {
                    "excess_sharpe": Metrics.sharpe(excess_ret, ppy),
                    "excess_sortino": Metrics.sortino(excess_ret, ppy),
                }
            )
        return metrics


def calculate_metrics(swings, y, capital_hist, benchmark_capital_hist=None, periods_per_year: float = 252.0):
    return Metrics(periods_per_year).compute_metrics(
        swings=swings,
        y=y,
        capital_hist=capital_hist,
        benchmark_capital_hist=benchmark_capital_hist,
        periods_per_year=periods_per_year,
    )
