"""
yfinance_source.py

Yahoo Finance Data Source Module

Fetches historical stock price data using the yfinance library.
This is the default data source as it's free, requires no API key,
and has no rate limits.

Key Features:
- Free access (no API key required)
- No rate limits
- Comprehensive coverage (stocks, ETFs, crypto)
- Automatically handles ticker format variations (e.g., . vs -)

Limitations:
- Data quality can vary for less-liquid securities
- May occasionally have gaps or missing data
- No SLA or guarantees
"""

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
        # (e.g., 'BRK.B' becomes 'BRK-B'). Create bidirectional mapping
        # to preserve original ticker format in response.
        ticker_map = {ticker: ticker.replace('.', '-') for ticker in tickers}
        yahoo_tickers = list(ticker_map.values())

        # Download historical data
        # - progress=False: Suppress yfinance download bar for cleaner logs
        # - auto_adjust=False: Get 'Adj Close' column explicitly (yfinance v0.2.0+ changed defaults)
        # - ['Adj Close']: Use adjusted close prices (accounts for splits and dividends)
        data = yf.download(yahoo_tickers, start=start, end=end, progress=False, auto_adjust=False)['Adj Close']
        
        if data.empty:
            print("No data returned from Yahoo Finance")
            return {}

        prices = {}

        # Process yfinance response
        # Modern yfinance (v0.2.0+) always returns DataFrame, even for single tickers
        # Older versions returned Series for single tickers - we handle both cases
        if isinstance(data, pd.DataFrame):
            # Multiple tickers: DataFrame with one column per ticker
            for original_ticker in tickers:
                yahoo_ticker = ticker_map[original_ticker]

                # Check if ticker column exists in response
                if yahoo_ticker in data.columns:
                    ticker_data = data[yahoo_ticker].dropna()  # Remove NaN values

                    if len(ticker_data) > 0:
                        # Convert to standardized format using original ticker symbol
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
            # Single ticker fallback: Series format (legacy yfinance behavior)
            # Unlikely with modern yfinance but kept for backward compatibility
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
