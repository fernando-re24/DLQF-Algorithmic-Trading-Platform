
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
    def compute_metrics(prices: pd.DataFrame, y: pd.DataFrame) -> dict:

        #Compute a classification report and confusion matrix wiht sklearn
        metrics = {}
        metrics["classification_report"] = classification_report(prices, y, output_dict=True)
        metrics["confusion_matrix"] = confusion_matrix(prices, y)

        return metrics
        
    """
    Runner for the simulation given our data and model.

    Return's the model's predicitons and metrics
    """
    def run_trading_sim(self, model, timestamps: pd.DataFrame, X: pd.DataFrame, y: pd.DataFrame, prices: pd.DataFrame) -> list[pd.DataFrame]:
        capital = self.init_capital
        cost = self.trading_cost

        # Dataframe storing the capital over time
        capital_hist = y

        for time in timestamps:
            preditions = model()

    
        return y, capital_hist

