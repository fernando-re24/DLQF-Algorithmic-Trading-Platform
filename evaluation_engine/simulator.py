
"""
Runs a trading simulation for a given model, outputting the model's performance
in terms of the final portfolio value, capital history, and metrics.
Author: Fernando Rivas Espinoza
"""

# Import libraries
from __future__ import annotations

import torch
import pandas as pd
import numpy as np

# Import metrics script

from .metrics import Metrics

__all__ = [
    'Simulator', 
    'run_trading_sim',
    ]

class Simulator:

    def __init__(self, init_capital: float, trading_cost: float):
        self.init_capital = init_capital
        self.trading_cost = trading_cost

    def _coerce_price_series(self, prices):
        if isinstance(prices, pd.Series):
            series = prices.astype(float)
        elif isinstance(prices, pd.DataFrame):
            if "Close" in prices.columns:
                series = prices["Close"].astype(float)
            elif len(prices.columns) == 1:
                series = prices.iloc[:, 0].astype(float)
            else:
                raise ValueError("Price input DataFrame must contain a 'Close' column or be single-column.")
        else:
            arr = np.asarray(prices, dtype=float).reshape(-1)
            series = pd.Series(arr)

        if not isinstance(series, pd.Series):
            raise ValueError(f"Price input must be Series/DataFrame/array-like, got {type(series).__name__}.")

        if len(series) == 0:
            raise ValueError("Price input is empty.")
        if not np.isfinite(series.to_numpy()).all():
            raise ValueError("Price input contains non-finite values.")
        return series.reset_index(drop=True)

    def _coerce_feature_matrix(self, X):
        if isinstance(X, pd.DataFrame):
            arr = X.to_numpy(dtype=float)
        elif isinstance(X, pd.Series):
            arr = np.asarray(X.to_numpy(), dtype=float).reshape(-1, 1)
        else:
            arr = np.asarray(X, dtype=float)

        if arr.ndim == 1:
            arr = arr.reshape(-1, 1)
        elif arr.ndim != 2:
            raise ValueError(f"Features must be 1D/2D array-like, got shape {arr.shape}.")

        if arr.size == 0:
            raise ValueError("Feature matrix is empty.")
        if not np.isfinite(arr).all():
            raise ValueError("Feature matrix contains non-finite values.")
        return arr

    def _coerce_swings(self, swings):
        arr = np.asarray(swings).reshape(-1)
        if len(arr) == 0:
            raise ValueError("Swings input is empty.")
        return arr.astype(float)

    def _infer_signal(self, logits: torch.Tensor) -> int:
        if logits.dim() == 1:
            logits = logits.unsqueeze(0)
        if logits.dim() != 2:
            raise ValueError("Model output must be 2D (batch, classes) or 1D (classes).")

        if logits.shape[0] != 1:
            raise ValueError("Model output should contain one row per input sample.")

        signal_idx = torch.argmax(logits, dim=1).item()
        if logits.shape[1] == 3:
            signal = int(signal_idx) - 1
        elif logits.shape[1] == 2:
            signal = -1 if signal_idx == 0 else 1
        elif logits.shape[1] == 1:
            # Binary directional score: positive => long, negative => short
            raw = logits[:, 0].item()
            signal = 1 if raw >= 0 else -1
        else:
            raise ValueError(f"Unsupported model class count: {logits.shape[1]} (expected 2 or 3).")
        if signal not in (-1, 0, 1):
            raise ValueError(f"Model output mapped to invalid signal: {signal}")
        return signal

    def _align_arrays(self, *arrays):
        n = min(len(a) for a in arrays if a is not None)
        if n == 0:
            raise ValueError("Aligned arrays have zero length.")
        return [a[:n] for a in arrays]

    def _build_signals_from_baseline(self, kind: str, prices: pd.Series, **kwargs):
        if kind == "buy_and_hold":
            return np.ones(len(prices), dtype=int)
        if kind == "moving_average_crossover":
            short_window = int(kwargs.get("short_window", 20))
            long_window = int(kwargs.get("long_window", 50))
            if short_window <= 0 or long_window <= 0:
                raise ValueError("MA windows must be positive.")
            if short_window >= long_window:
                raise ValueError("short_window must be less than long_window.")

            short_ma = prices.rolling(window=short_window, min_periods=long_window).mean()
            long_ma = prices.rolling(window=long_window, min_periods=long_window).mean()
            signals = np.zeros(len(prices), dtype=int)
            if len(prices) >= long_window:
                signals[long_ma.notna()] = np.where(
                    short_ma[long_ma.notna()] > long_ma[long_ma.notna()],
                    1,
                    -1,
                )
            return signals
        if kind == "random":
            seed = kwargs.get("seed", None)
            rng = np.random.default_rng(seed)
            return rng.choice(np.array([-1, 0, 1], dtype=int), size=len(prices))
        raise ValueError(f"Unsupported baseline '{kind}'.")

    """
    Simulate a simple buy-and-hold benchmark (buy on first bar, hold 1 unit).

    Returns the capital history, final portfolio value, and total return so it
    can be compared directly against a model-driven run.
    """
    def buy_and_hold(self, prices: pd.Series | list[float]):
        prices = self._coerce_price_series(prices)
        signals = np.ones(len(prices), dtype=int)
        return self._execute_signals(signals, prices)

    """
    Shared execution engine for a stream of position signals (0 = flat, 1 = long)
    """
    def _execute_signals(self, signals, prices):
        signals = np.asarray(signals, dtype=int).reshape(-1)
        prices = self._coerce_price_series(prices).to_numpy(dtype=float)

        min_len = min(len(signals), len(prices))
        if min_len == 0:
            raise ValueError("Signals or prices are empty.")

        signals = signals[:min_len]
        prices = prices[:min_len]
        cash, position, cost = self.init_capital, 0.0, self.trading_cost
        capital_hist = []

        for signal, price in zip(signals, prices):
            if signal not in (-1, 0, 1):
                raise ValueError(f"Invalid signal value encountered: {signal}")
            trade = signal - position

            if trade != 0:
                cash -= trade * price + cost * abs(trade)
                position = signal

            capital_hist.append(cash + position * price)

        final_value = capital_hist[-1] if capital_hist else cash
        total_return = (final_value - self.init_capital) / self.init_capital

        return capital_hist, final_value, total_return
        

    
    """
    Runner for the simulation given our data and model.

    Return's the model's predictions and metrics
    """
    def run_trading_sim(self, model: torch.nn.Module, device :str, swings: list, X: pd.DataFrame, prices: pd.DataFrame) -> list[pd.DataFrame]:
        model.eval()
        price_series = self._coerce_price_series(prices)
        features = self._coerce_feature_matrix(X)
        swings_arr = self._coerce_swings(swings)

        cash, position, cost = self.init_capital, 0.0, self.trading_cost
        y = []
        capital_hist = []

        n_steps, n_features = features.shape
        n_len = min(n_steps, len(price_series), len(swings_arr))
        if n_len == 0:
            raise ValueError("No data points available for simulation.")

        features = features[:n_len]
        price_series = price_series.iloc[:n_len].to_numpy(dtype=float)

        # Iterate through the prices and features
        with torch.no_grad():
            for i in range(n_len):
                x_row = features[i]
                price = price_series[i]
                logits = model(torch.as_tensor(x_row, device=device, dtype=torch.float32).unsqueeze(0))
                signal = self._infer_signal(logits)

                # +1 buy, -1 sell, 0 hold
                trade = signal - position

                # If we make a trade, update our cash value
                if trade != 0:
                    # Cash decremented by trade cost for this asset. either incremented by sell price or decremented by buy price
                    cash -= trade * price + cost * abs(trade)

                    # Update value of portfolio and add to the capital history
                    position = float(signal)

                portfolio_val = cash + position * price
                capital_hist.append(float(portfolio_val))
                y.append(int(signal))

        # Buy-and-hold benchmark (buy first bar, hold long)
        bh_capital_hist, bh_final, bh_return = self.buy_and_hold(price_series[:n_len])

        # Model performance summary
        model_final = capital_hist[-1] if capital_hist else cash
        model_return = (model_final - self.init_capital) / self.init_capital

        # Get metrics and append comparison figures
        metrics = Metrics().compute_metrics(swings, y, capital_hist=capital_hist, benchmark_capital_hist=bh_capital_hist)
      
        metrics.update(
            {
                "capital_history": capital_hist,
                "final_value": model_final,
                "total_return": model_return,
                "buy_and_hold_capital_history": bh_capital_hist,
                "buy_and_hold_final_value": bh_final,
                "buy_and_hold_total_return": bh_return,
                "outperformance_value": model_final - bh_final,
                "outperformance_pct": model_return - bh_return,
                "price_series_length": n_len,
            }
        )

        return y, capital_hist, metrics

    """
    Run baseline strategy simulations on the same price path.
    """
    def run_benchmark_suite(
        self,
        prices,
        swings=None,
        baselines=None,
        ma_short_window=20,
        ma_long_window=50,
        random_seed=0,
    ) -> dict[str, dict]:
        price_series = self._coerce_price_series(prices)
        swings_arr = self._coerce_swings(swings) if swings is not None else None
        if baselines is None:
            baselines = ("buy_and_hold", "moving_average_crossover", "random")

        benchmark_results = {}
        metrics = Metrics()
        for baseline_name in baselines:
            signals = self._build_signals_from_baseline(
                baseline_name,
                price_series,
                short_window=ma_short_window,
                long_window=ma_long_window,
                seed=random_seed,
            )
            cap, final_value, total_return = self._execute_signals(signals, price_series)
            result = {
                "signals": signals.tolist(),
                "capital_history": cap,
                "final_value": final_value,
                "total_return": total_return,
            }

            if swings_arr is not None:
                _, swings_bench = self._align_arrays(swings_arr, signals)
                result["metrics"] = metrics.compute_metrics(
                    swings_bench,
                    signals,
                    cap,
                    benchmark_capital_hist=None,
                )

            benchmark_results[baseline_name] = result

        return benchmark_results
