"""
data_adapter.py

Data Source Abstraction Layer

Provides a unified interface for fetching stock price data from multiple sources.
Handles source-specific initialization, API key management, and request routing.

Supported Sources:
- yfinance: Free Yahoo Finance data (default, no API key required)
- alpha_vantage: Alpha Vantage API (requires API key, has rate limits)

Usage:
    provider = DataProvider(source='yfinance')
    prices = provider.get_prices(['AAPL', 'MSFT'], '2023-01-01', '2024-01-01')
"""

from sources import yfinance_source, alpha_vantage_source
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class DataProvider:
    """
    Unified data provider interface for stock price fetching.

    Abstracts away source-specific implementation details and provides
    a consistent API for retrieving historical price data.
    """

    def __init__(self, source: str = "yfinance", api_key: str = None):
        """
        Initialize the data provider.

        Args:
            source: Data source name ('yfinance' or 'alpha_vantage')
            api_key: API key for sources that require authentication

        Raises:
            ValueError: If source is unsupported or required API key is missing
        """
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
        Fetch historical price data from the configured source.

        Routes the request to the appropriate source module (yfinance or alpha_vantage)
        and handles source-specific parameter passing (e.g., API keys).

        Args:
            tickers: List of stock ticker symbols (e.g., ['AAPL', 'MSFT'])
            start: Start date in YYYY-MM-DD format
            end: End date in YYYY-MM-DD format

        Returns:
            dict: Mapping of ticker to price data
                {
                    'AAPL': [
                        {'date': '2023-01-01', 'close': 150.25},
                        ...
                    ],
                    ...
                }

        Raises:
            Exception: If data fetch fails (source-specific exceptions)
        """
        # Route to source-specific fetch function
        if self.source_name == 'alpha_vantage':
            return self.source.fetch_prices(tickers, start, end, api_key=self.api_key)
        return self.source.fetch_prices(tickers, start, end)


def get_provider_from_env() -> DataProvider:
    """
    Create a DataProvider instance from environment variables.

    Reads configuration from .env file:
        DATA_SOURCE: 'yfinance' or 'alpha_vantage' (default: yfinance)
        ALPHAVANTAGE_API_KEY: API key for Alpha Vantage (if using that source)

    Returns:
        DataProvider: Configured data provider instance

    Raises:
        ValueError: If configuration is invalid (e.g., missing API key for Alpha Vantage)
    """
    source = os.getenv("DATA_SOURCE", "yfinance")
    api_key = os.getenv("ALPHAVANTAGE_API_KEY")
    return DataProvider(source=source, api_key=api_key)
