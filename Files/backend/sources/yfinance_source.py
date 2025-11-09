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

        # Yahoo Finance uses hyphens instead of periods in ticker symbols
        # Map original tickers to Yahoo format
        ticker_map = {ticker: ticker.replace('.', '-') for ticker in tickers}
        yahoo_tickers = list(ticker_map.values())

        # Download data with progress=False to reduce console noise
        # Set auto_adjust=False to get the 'Adj Close' column (yfinance changed default to True)
        data = yf.download(yahoo_tickers, start=start, end=end, progress=False, auto_adjust=False)['Adj Close']
        
        if data.empty:
            print("No data returned from Yahoo Finance")
            return {}

        prices = {}

        # yfinance now always returns a DataFrame (even for single tickers)
        if isinstance(data, pd.DataFrame):
            for original_ticker in tickers:
                yahoo_ticker = ticker_map[original_ticker]
                if yahoo_ticker in data.columns:
                    ticker_data = data[yahoo_ticker].dropna()
                    if len(ticker_data) > 0:
                        # Use original ticker in the response
                        prices[original_ticker] = [
                            {"date": index.strftime('%Y-%m-%d'), "close": float(value)}
                            for index, value in ticker_data.items()
                        ]
                        print(f"Fetched {len(ticker_data)} data points for {original_ticker}")
                    else:
                        print(f"No valid data for {original_ticker}")
                else:
                    print(f"Ticker {original_ticker} not found in response")
        else:
            # Fallback for Series (legacy behavior, unlikely with new yfinance)
            original_ticker = tickers[0]
            ticker_data = data.dropna()
            if len(ticker_data) > 0:
                prices[original_ticker] = [
                    {"date": index.strftime('%Y-%m-%d'), "close": float(value)}
                    for index, value in ticker_data.items()
                ]
                print(f"Fetched {len(ticker_data)} data points for {original_ticker}")
            else:
                print(f"No valid data for {original_ticker}")

        print(f"Successfully fetched data for {len(prices)}/{len(tickers)} ticker(s)")
        return prices
        
    except Exception as e:
        print(f"Error fetching data from Yahoo Finance: {e}")
        return {}
