import yfinance as yf
import pandas as pd

def fetch_prices(tickers: list[str], start: str, end: str) -> dict:
    """
    Fetches historical price data from yfinance.

    Args:
        tickers: A list of stock tickers.
        start: The start date in YYYY-MM-DD format.
        end: The end date in YYYY-MM-DD format.

    Returns:
        A dictionary where keys are tickers and values are lists of dicts
        with 'date' and 'close' price.
    """
    try:
        print(f"Fetching data for {len(tickers)} ticker(s) from Yahoo Finance...")
        
        # Download data with progress=False to reduce console noise
        # Set auto_adjust=False to get the 'Adj Close' column (yfinance changed default to True)
        data = yf.download(tickers, start=start, end=end, progress=False, auto_adjust=False)['Adj Close']
        
        if data.empty:
            print("No data returned from Yahoo Finance")
            return {}

        prices = {}

        # yfinance now always returns a DataFrame (even for single tickers)
        if isinstance(data, pd.DataFrame):
            for ticker in tickers:
                if ticker in data.columns:
                    ticker_data = data[ticker].dropna()
                    if len(ticker_data) > 0:
                        prices[ticker] = [
                            {"date": index.strftime('%Y-%m-%d'), "close": float(value)}
                            for index, value in ticker_data.items()
                        ]
                        print(f"Fetched {len(ticker_data)} data points for {ticker}")
                    else:
                        print(f"No valid data for {ticker}")
                else:
                    print(f"Ticker {ticker} not found in response")
        else:
            # Fallback for Series (legacy behavior, unlikely with new yfinance)
            ticker = tickers[0]
            ticker_data = data.dropna()
            if len(ticker_data) > 0:
                prices[ticker] = [
                    {"date": index.strftime('%Y-%m-%d'), "close": float(value)}
                    for index, value in ticker_data.items()
                ]
                print(f"Fetched {len(ticker_data)} data points for {ticker}")
            else:
                print(f"No valid data for {ticker}")

        print(f"Successfully fetched data for {len(prices)}/{len(tickers)} ticker(s)")
        return prices
        
    except Exception as e:
        print(f"Error fetching data from Yahoo Finance: {e}")
        return {}
