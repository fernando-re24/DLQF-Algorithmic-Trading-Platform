"""
Generate Vizualizations of a trading simulation
Author: Fernando Espinoza
"""
# Import libraries
import matplotlib as plt
import pandas as pd
import numpy as np

__all__ = ['Vizulaizations', 'captial_hist', 'capital_hist_comparison', 'signals', 'signals_comparison']

class Vizualizations:

    """Plots the capital history of one model for a trading simulation"""
    def capital_hist(hist: pd.DataFrame):
        return

    """
    Plot comparing the capital histories of 2 models for the same dataset
    """
    def capital_hist_comparison(hist1: pd.DataFrame, hist2: pd.DataFrame):
        return
    
    """Plots the swing predicitons of one model during a trading simulation"""
    def signals(swings: pd.DataFrame):
        return

    """Plots comapring the swing predicitons of two models during a trading simulation"""
    def signals_comparison(swings1: pd.DataFrame, swings2: pd.DataFrame):
        return
