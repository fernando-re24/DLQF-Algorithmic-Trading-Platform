
"""
Runs a trading simulation for a given model, outputting the model's performance
in terms of the final portfolio value, capital history, and metrics.
Author: Fernando Rivas Espinoza
"""

# Import libraries
from sklearn.metrics import classification_report, confusion_matrix
from datetime import datetime, timedelta
import torch
import pandas as pd
import numpy as np

__all__ = ['Simulator', 'run_trading_sim']

class Simulator:

    def __init__(self, init_capital: float, trading_cost: float):
        self.init_capital = init_capital
        self.trading_cost = trading_cost

    """
    A buy and hold prediction for some hold
    """
    def buy_and_hold(hold) -> int:
        prediction = hold
        if hold == 0:
            return 1
        else:
            return 0
        

    """
    Compute model performance metrics after a simulation run
    """
    def compute_metrics(swings: pd.DataFrame, y: pd.DataFrame) -> dict:

        #Compute a classification report and confusion matrix wiht sklearn
        metrics = {}
        metrics["classification_report"] = classification_report(swings, y, output_dict=True)
        metrics["confusion_matrix"] = confusion_matrix(swings, y)

        return metrics
        
    """
    Runner for the simulation given our data and model.

    Return's the model's predicitons and metrics
    """
    def run_trading_sim(self, model: torch.model, device :str, timestamps: pd.DataFrame, X: pd.DataFrame, prices: pd.DataFrame) -> list[pd.DataFrame]:
        
        # Init our chash to the intial capital, position to 0 (0, flat, 1 long), trading cost to a local variable, y to empty list
        cash, position, cost, y = self.init_capital, 0.0, self.trading_cost, []

        # Dataframe storing the capital over time
        capital_hist = []

        # Iterate through the prices and features
        for i, (x_row, price) in enumerate(zip, X, prices):
           
           # Prevent model updates
           with torch.no_grad():
               # Get logits from x_row input with batch dimension
               logits = model(torch.tensor(x_row, device = device).unsqueeze(0))

               # Get the trade singal from the logits by getting the maximum value and converting to int
               signal = torch.argmax(logits, dim = 1).item()
        
        # +1 buy, -1 sell, 0 hold
        trade = signal - position

        # If we make a trade, update our cash value
        if trade != 0:
            # Cash decremented by trade cost for this asset. either incremented by sell price or decremented by buy price
            cash -= trade*price + cost*abs(trade)

            # Update value of portfolio and add to the capital history
            position = signal
            portfolio_val = cash + position*price
            capital_hist.append(portfolio_val)
            y[i] = signal
        
        return y, capital_hist

