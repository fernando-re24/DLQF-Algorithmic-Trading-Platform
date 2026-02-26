"""
Ensures the simulator gets clean inputs 
Author: Fernando Rivas Espinoza
"""

# Imports
import torch
from torch.utils.data import TensorDataset, DataLoader
import pandas as pd
import numpy as np

__all__ = ['Loader', 'load_model', 'load_data']

class Loader:
    def __init__(self, model, path_to_data):
        self.model = model
        self.path_to_data = path_to_data
     
    """ 
    Load the model with torch
    """
    def load_model(self, device = "cpu") -> None:

        # If CUDA is available, set the device to it
        if torch.cuda.is_available():
            device = "cuda"
        
        # Use torch to load the model onto the device
        self.model = torch.load(self.model, map_location = device)
        self.model.eval()
        self.device = device
        print(f"Model loaded onto {device}")
    
    """
    Load the data from a csv to plug-and-play X, y, timestamp, and price dataframes
    """
    def load_data(self) -> pd.DataFrame:

        price_cols = ["Open", "Low", "High", "Close"]
        # Read from csv while parsing the timestamp column for datetimes
        df = pd.read_csv(self.path_to_data, parse_dates = ["timestamp"])

        prices = df["Close"]

        # Set list of feature cokumns to all non price or timestamp columns
        features = [col for col in df.columns if not col in price_cols or col.startswith("timestamp")]

        X = df[features].values

        timestamps = df.timestamp.values

        # Iterate through prices and classify price swings 
        swings = y
        for i in range(len(prices["Close"]) - 1):
            curr_price = prices["close"].iloc(i)
            next_price = prices["close"].iloc(i + 1)

            #Calculate and normalize price cahange to get swing
            price_diff = next_price - curr_price
            match abs(price_diff)/price_diff :
                case 1:
                    swings["prediction"].iloc(i) = 1
                case 0: 
                    swings["prediction"].iloc(i) = 1
                case -1:
                    swings["prediction"].iloc(i) = -1

        print("Data loaded")

        return timestamps, X, prices, swings


        

