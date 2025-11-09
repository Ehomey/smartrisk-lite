import requests
import time
from typing import List, Dict

def fetch_prices(tickers: List[str], start: str, end: str, api_key: str) -> Dict:
    """
    Fetches historical price data from Alpha Vantage.

    Args:
        tickers: A list of stock tickers.
        start: The start date in YYYY-MM-DD format.
        end: The end date in YYYY-MM-DD format.
        api_key: Your Alpha Vantage API key.

    Returns:
        A dictionary where keys are tickers and values are lists of dicts
        with 'date' and 'close' price.
    """
    prices = {}
    failed_tickers = []
    
    for i, ticker in enumerate(tickers):
        # Rate limiting: Alpha Vantage free tier allows 5 requests/minute
        if i > 0 and i % 5 == 0:
            print(f"Rate limit pause: processed {i} tickers, waiting 60 seconds...")
            time.sleep(60)

        print(f"Fetching data for {ticker} ({i+1}/{len(tickers)})...")
        
        url = f'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={ticker}&apikey={api_key}&outputsize=full'
        
        try:
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            data = r.json()

            # Check for API-specific errors
            if "Error Message" in data:
                print(f"Alpha Vantage error for {ticker}: {data['Error Message']}")
                failed_tickers.append(ticker)
                continue
                
            if "Note" in data:
                print(f"Alpha Vantage rate limit message for {ticker}: {data['Note']}")
                # Wait and retry once
                print("Waiting 60 seconds before retry...")
                time.sleep(60)
                r = requests.get(url, timeout=10)
                data = r.json()

            if "Time Series (Daily)" not in data:
                error_msg = data.get('Note') or data.get('Error Message') or data.get('Information') or f'Unknown error - Response keys: {list(data.keys())}'
                print(f"Could not fetch data for {ticker} from Alpha Vantage: {error_msg}")

                # Check for common API key issues
                if "Invalid API call" in str(data) or "premium endpoint" in str(data).lower():
                    print(f"API Key issue detected. Verify your Alpha Vantage API key is valid and has the required permissions.")

                failed_tickers.append(ticker)
                continue

            ticker_prices = []
            for date, values in data["Time Series (Daily)"].items():
                if start <= date <= end:
                    ticker_prices.append({
                        "date": date,
                        "close": float(values["5. adjusted close"])
                    })
            
            if not ticker_prices:
                print(f"No data found for {ticker} in the specified date range")
                failed_tickers.append(ticker)
                continue
                
            prices[ticker] = sorted(ticker_prices, key=lambda x: x['date'])
            print(f"Successfully fetched {len(ticker_prices)} data points for {ticker}")

        except requests.exceptions.Timeout:
            print(f"Request timed out for {ticker}")
            failed_tickers.append(ticker)
        except requests.exceptions.RequestException as e:
            print(f"Request failed for {ticker}: {e}")
            failed_tickers.append(ticker)
        except (KeyError, ValueError) as e:
            print(f"Data parsing error for {ticker}: {e}")
            failed_tickers.append(ticker)
        except Exception as e:
            print(f"Unexpected error for {ticker}: {e}")
            failed_tickers.append(ticker)

    if failed_tickers:
        print(f"Failed to fetch data for: {', '.join(failed_tickers)}")
    
    print(f"Successfully fetched data for {len(prices)}/{len(tickers)} tickers")
    return prices
