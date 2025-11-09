from sources import yfinance_source, alpha_vantage_source
import os
from dotenv import load_dotenv

load_dotenv()

class DataProvider:
    def __init__(self, source="yfinance", api_key=None):
        self.source_name = source
        self.api_key = api_key

        if source == "yfinance":
            self.source = yfinance_source
        elif source == "alpha_vantage":
            if not api_key:
                raise ValueError("API key is required for Alpha Vantage source.")
            self.source = alpha_vantage_source
        else:
            raise ValueError(f"Source '{source}' is not supported.")

    def get_prices(self, tickers: list[str], start: str, end: str) -> dict:
        """
        Fetches prices from the configured data source.

        Args:
            tickers: A list of stock tickers.
            start: The start date in YYYY-MM-DD format.
            end: The end date in YYYY-MM-DD format.

        Returns:
            A dictionary of prices.
        """
        if self.source_name == 'alpha_vantage':
            return self.source.fetch_prices(tickers, start, end, api_key=self.api_key)
        return self.source.fetch_prices(tickers, start, end)


def get_provider_from_env():
    """
    Initializes a DataProvider based on environment variables.
    """
    source = os.getenv("DATA_SOURCE", "yfinance")
    api_key = os.getenv("ALPHAVANTAGE_API_KEY")
    return DataProvider(source=source, api_key=api_key)
