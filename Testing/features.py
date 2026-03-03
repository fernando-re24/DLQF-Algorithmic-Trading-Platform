"""
Add features to a single asset's default time series
Author: Fernando Rivas Espinoza
"""
import pandas as pd
import numpy as np

__all__ = ["features", "add_features"]

def calculate_sma(series, length):
    """Simple Moving Average"""
    return series.rolling(window=length).mean()

def calculate_ema(series, length):
    """Exponential Moving Average"""
    return series.ewm(span=length, adjust=False).mean()

def calculate_rsi(close, length=14):
    """Relative Strength Index"""
    delta = close.diff()
    gain = delta.where(delta > 0, 0).rolling(window=length).mean()
    loss = -delta.where(delta < 0, 0).rolling(window=length).mean()

    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate_bollinger_bands(close, length=20, num_std_dev=2):
    """Bollinger Bands"""
    mid = close.rolling(window=length).mean()
    std = close.rolling(window=length).std()

    upper = mid + (std * num_std_dev)
    lower = mid - (std * num_std_dev)

    return upper, mid, lower

def calculate_macd(close, fast=12, slow=26, signal=9):
    """Moving Average Convergence Divergence"""
    fast_ema = calculate_ema(close, fast)
    slow_ema = calculate_ema(close, slow)

    macd_line = fast_ema - slow_ema
    signal_line = calculate_ema(macd_line, signal)
    histogram = macd_line - signal_line

    return macd_line, signal_line, histogram

def calculate_atr(high, low, close, length=14):
    """Average True Range"""
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=length).mean()

    return atr

def calculate_stoch(high, low, close, k_period=14, d_period=3):
    """Stochastic Oscillator"""
    lowest_low = low.rolling(window=k_period).min()
    highest_high = high.rolling(window=k_period).max()

    k = 100 * ((close - lowest_low) / (highest_high - lowest_low))
    d = k.rolling(window=d_period).mean()

    return k, d

def calculate_obv(close, volume):
    """On-Balance Volume"""
    obv = pd.Series(index=close.index, dtype='float64')
    obv.iloc[0] = volume.iloc[0]

    for i in range(1, len(close)):
        if close.iloc[i] > close.iloc[i-1]:
            obv.iloc[i] = obv.iloc[i-1] + volume.iloc[i]
        elif close.iloc[i] < close.iloc[i-1]:
            obv.iloc[i] = obv.iloc[i-1] - volume.iloc[i]
        else:
            obv.iloc[i] = obv.iloc[i-1]

    return obv

"""
Convert the date column to a pandas DateTime
"""
def date_index(df: pd.DataFrame) -> pd.DataFrame:
  df.reset_index(drop = False, inplace = True)

  df['date'] = df['date'].astype(str).str[:19] #convert the date column to a string & drop the '-4:00' for conversion to datetime

  df = date_sincos_transform(df)

  df.set_index(['date'], inplace = True, drop = True) #sets the index of each dataframe to the date column as a datetime object

  pd.DatetimeIndex(df.index)

  df = df[~df.index.duplicated()]
  return df

def stochastic_signal(k, d) -> int:
  if k > d and k >= 80:
      return 1
  elif k < d and k <= 20:
      return -1
  else:
      return 0

"""
Add technical indicators to dataframe by group (stock)
"""
def add_indicators(df_group):
 
  # Make a copy to avoid SettingWithCopyWarning
  df_group = df_group.copy()

  # Trend indicators
  df_group['SMA_10'] = calculate_sma(df_group['close'], 10)
  df_group['EMA_60'] = calculate_ema(df_group['close'], 60)
  df_group['VOLUME_SMA_20'] = calculate_sma(df_group['volume'], 20)

  # Volatility indicators
  bb_upper, bb_middle, bb_lower = calculate_bollinger_bands(df_group['close'], 20)
  df_group['BB_UPPER_20'] = bb_upper
  df_group['BB_MIDDLE_20'] = bb_middle
  df_group['BB_LOWER_20'] = bb_lower

  # Calculate 20-period Donchian Channel
  df_group['DC_UPPER_20'] = df_group['high'].rolling(window=20).max()
  df_group['DC_LOWER_20'] = df_group['low'].rolling(window=20).min()

  # ATR
  df_group['ATR_14'] = calculate_atr(df_group['high'], df_group['low'], df_group['close'], 14)

  # Momentum indicators
  df_group['RSI_14'] = calculate_rsi(df_group['close'], 14)

  stoch_k, stoch_d = calculate_stoch(df_group['high'], df_group['low'], df_group['close'], 14, 3)
  df_group['STOCH_K'] = stoch_k
  df_group['STOCH_D'] = stoch_d

  macd_line, signal_line, histogram = calculate_macd(df_group['close'])
  df_group['MACD_LINE'] = macd_line
  df_group['MACD_SIGNAL'] = signal_line
  df_group['MACD_HIST'] = histogram

  # Volume indicators
  df_group['OBV'] = calculate_obv(df_group['close'], df_group['volume'])

  # Convert momentum indicators to signals
  df_group['RSI_SIGNAL'] = df_group['RSI_14'].apply(lambda x: -1 if pd.notna(x) and 0 <= x <= 30 else (1 if pd.notna(x) and 70 <= x <= 100 else 0))

  df_group['STOCH_SIGNAL'] = df_group.apply(
      lambda row: stochastic_signal(row['STOCH_K'], row['STOCH_D']) if pd.notna(row['STOCH_K']) and pd.notna(row['STOCH_D']) else 0,
      axis=1
  )
  df_group.drop(['RSI_14', 'STOCH_K', 'STOCH_D', 'index'], axis = 1, inplace = True)
  return df_group

#Transformations in the form: f(2pi(value/max))
def date_sincos_transform(df: pd.DataFrame) -> pd.DataFrame:

    df['date'] = pd.to_datetime(df['date'])

    # Extract date components
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df['year'] = df['date'].dt.year
    df['hour'] = df['date'].dt.hour
    df['minute'] = df['date'].dt.minute

    # Day of month
    df['day_sin'] = np.sin(df['day'] * (2. * np.pi / 30))
    df['day_cos'] = np.cos(df['day'] * (2. * np.pi / 30))

    # Hour of day
    df['hour_sin'] = np.sin(df['hour'] * (2. * np.pi / 24))
    df['hour_cos'] = np.cos(df['hour'] * (2. * np.pi / 24))

    # Minute of hour
    df['minute_sin'] = np.sin(df['minute'] * (2. * np.pi / 60))
    df['minute_cos'] = np.cos(df['minute'] * (2. * np.pi / 60))
    df.drop(['day', 'year', 'hour', 'minute'], axis = 1, inplace = True)
    return df

"""
Convert to a dataframe and add the features
"""
def add_features(csvs):
  ID = 0
  stock_dfs = []
  for csv in csvs:
    df = pd.read_csv(csv)
    df = date_index(df)
    df = add_indicators(df)
    df = df.iloc[200:]
    df.fillna(0, inplace=True)
    df['stock_id'] = ID
    ID += 1
    print(len(df))
    stock_dfs.append(df)

  combined_df = pd.concat(stock_dfs, ignore_index=True)
  print(f"Combined DataFrame has {len(combined_df)} rows")
  return combined_df

