
"""
Runs a trading simulation for a given model, outputting the model's performance
in terms of the final portfolio value, capital history, and metrics.
Author: Fernando Rivas Espinoza
"""

# Import libraries
import torch
import pandas as pd
import numpy as np

# Import metrics script

from .metrics import Metrics

__all__ = ['Simulator', 'run_trading_sim']

class Simulator:

    def __init__(self, init_capital: float, trading_cost: float):
        self.init_capital = init_capital
        self.trading_cost = trading_cost

    """
    Simulate a simple buy-and-hold benchmark (buy on first bar, hold 1 unit).

    Returns the capital history, final portfolio value, and total return so it
    can be compared directly against a model-driven run.
    """
    def buy_and_hold(self, prices: pd.Series | list[float]):
        signals = [1] * len(prices)  #long from the start, never exit
        return self._execute_signals(signals, prices)

    """
    Shared execution engine for a stream of position signals (0 = flat, 1 = long)
    """
    def _execute_signals(self, signals, prices):
        cash, position, cost = self.init_capital, 0.0, self.trading_cost
        capital_hist = []

        for signal, price in zip(signals, prices):
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

    Return's the model's predicitons and metrics
    """
    def run_trading_sim(self, model: torch.nn.Module, device :str, swings: list, X: pd.DataFrame, prices: pd.DataFrame) -> list[pd.DataFrame]:

        # Init our cash to the initial capital, position to 0 (0 = flat, 1 = long)
        cash, position, cost, y = self.init_capital, 0.0, self.trading_cost, []

        # Dataframe storing the capital over time
        capital_hist = []

        # Iterate through the prices and features
        for i, (x_row, price) in enumerate(zip(X, prices)):

            # Prevent model updates
            with torch.no_grad():
                # Get logits from x_row input with batch dimension
                logits = model(torch.tensor(x_row, device=device).unsqueeze(0))

                # Get the trade signal from the logits by getting the maximum value and converting to int
                signal = torch.argmax(logits, dim=1).item()

            # +1 buy, -1 sell, 0 hold
            trade = signal - position

            # If we make a trade, update our cash value
            if trade != 0:
                # Cash decremented by trade cost for this asset. either incremented by sell price or decremented by buy price
                cash -= trade * price + cost * abs(trade)

                # Update value of portfolio and add to the capital history
                position = signal
            portfolio_val = cash + position * price
            capital_hist.append(portfolio_val)
            y.append(signal)

        # Buy-and-hold benchmark (buy first bar, hold long)
        bh_capital_hist, bh_final, bh_return = self.buy_and_hold(prices)

        # Model performance summary
        model_final = capital_hist[-1] if capital_hist else cash
        model_return = (model_final - self.init_capital) / self.init_capital

        # Get metrics and append comparison figures
        metrics = Metrics.compute_metrics(swings, y)
      
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
            }
        )

        return y, capital_hist, metrics

