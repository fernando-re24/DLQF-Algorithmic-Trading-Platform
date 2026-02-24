# Import libraries
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

data_path = "" # Some path to the databeing used in the simulation

"""
Load the data in from the path and convert it into a dataframe
Returns a dataframe with the prices of the stock basket

Will add additional processing 
"""
def load_data():
    return  pd.read_csv(data_path)

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