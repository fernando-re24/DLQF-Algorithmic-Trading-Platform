"""
Ensures the simulator gets clean inputs 
Author: Fernando Rivas Espinoza
"""

# Imports
import torch
import pandas as pd
import numpy as np

__all__ = [
    'Loader', 
    'load_model', 
    'load_data',
]

class Loader:
    def __init__(self, model, df: pd.DataFrame, feature_script: str):
        self.model = model
        self.df = df
        self.feature_script = feature_script
     
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
        df = self.df

        prices = df["Close"]

        # Set list of feature columns to all non price or timestamp columns
        features = [col for col in df.columns if (col not in price_cols) and (not col.startswith("timestamp"))]

        X = df[features].values

        timestamps = df.timestamp.values

        # Iterate through prices and classify price swings 
        swings = pd.DataFrame(index = timestamps, columns= ["prediction"])

        for i in range(len(prices) - 1):
            curr_price = prices.iloc[i]
            next_price = prices.iloc[i + 1]

            #Calculate and normalize price change to get swing
            price_diff = next_price - curr_price
            swing = np.sign(price_diff)
            swings["prediction"].iat[i] = swing

        # Last timestamp has no look-ahead price; default to flat swing
        if len(swings) > 0:
            swings["prediction"].iat[-1] = 0

        print("Data loaded")

        return timestamps, X, prices, swings

        


        

