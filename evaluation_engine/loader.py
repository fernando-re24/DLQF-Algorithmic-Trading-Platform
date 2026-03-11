"""
Ensures the simulator gets clean inputs 
Author: Fernando Rivas Espinoza
"""
from __future__ import annotations

# Imports
import torch
import pandas as pd
import numpy as np

from .feature_runner import run_feature_script

__all__ = [
    'Loader', 
    'load_model', 
    'load_data',
]

class Loader:
    def __init__(
        self,
        model,
        df: pd.DataFrame,
        feature_script: str | None = None,
        feature_args: dict | None = None,
        feature_fn: str = "build_features",
        strict_feature_validation: bool = True,
        max_feature_runtime_sec: float = 5.0,
        non_numeric_whitelist: list[str] | None = None,
    ):
        self.model = model
        self.df = df
        self.feature_script = feature_script
        self.feature_args = feature_args or {}
        self.feature_fn = feature_fn
        self.strict_feature_validation = strict_feature_validation
        self.max_feature_runtime_sec = max_feature_runtime_sec
        self.non_numeric_whitelist = non_numeric_whitelist or []
        self.feature_script_metadata: dict | None = None
     
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

        if self.feature_script:
            feature_metadata: dict = {}
            feature_df = run_feature_script(
                self.feature_script,
                df,
                self.feature_args,
                feature_fn=self.feature_fn,
                strict=self.strict_feature_validation,
                max_runtime_sec=self.max_feature_runtime_sec,
                non_numeric_whitelist=self.non_numeric_whitelist,
                metadata=feature_metadata,
            )
            self.feature_script_metadata = feature_metadata
            X = feature_df.values
        else:
            # Set list of feature columns to all non price or timestamp columns
            features = [col for col in df.columns if (col not in price_cols) and (not col.startswith("timestamp"))]
            feature_df = df[features]
            self.feature_script_metadata = {
                "script_path": None,
                "feature_fn": None,
                "elapsed_sec": 0.0,
                "row_count": int(len(feature_df)),
                "feature_count": int(feature_df.shape[1]),
                "warnings": [],
            }
            X = feature_df.values

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

        


        

