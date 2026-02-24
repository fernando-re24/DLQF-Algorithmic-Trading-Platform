# Import libraries
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class Simulator:

    def __init__(self, path_to_data: str, init_capital: float, model, trading_cost: float):
        self.path_to_data = path_to_data
        self.init_capital = init_capital
        self.model = model
        self.trading_cost = trading_cost
        
    """
    Load the data in from the path and convert it into a dataframe
    Returns a dataframe with the prices of the stock basket

    Will add additional processing 
    """
    def load_data(self) -> pd.DataFrame:
        print("loading data...")

        df = pd.read_csv(self.path_to_data)

        return df

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
    Runner for the simulation given our data and model.

    Return's the model's predicitons and metrics
    """
    def run_trading_sim(self):
        data = self.load_data()
        capital = self.init_capital
        model = self.model
        cost = self.trading_cost

        # Dataframe storing the capital over time
        capital_hist = data
    


        #To be implemented
        return capital, capital_hist

