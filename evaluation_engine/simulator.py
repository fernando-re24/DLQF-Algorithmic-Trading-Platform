# Import libraries
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class Simulator:

    """
    Load the data in from the path and convert it into a dataframe
    Returns a dataframe with the prices of the stock basket

    Will add additional processing 
    """
    def load_data():
        return pd.read_csv(data_path)

    """
    A buy and hold prediction for some hold
    """
    def buy_and_hold(hold):
        prediction = hold
        if hold == 0:
            return 1
        else:
            return 0
        
    """
    Runner for the simulation given our data and model.

    Return's the model's predicitons and metrics
    """
    def run_trading_sim(data, model):
        #To be implemented
        return 

    def __init__(self, path_to_data: str, init_capital: float, model):
        self.path_to_data = path_to_data
        self.init_capital = init_capital
        self.model = model
