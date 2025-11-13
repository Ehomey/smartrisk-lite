"""
Stock Data Caching Module

Provides intelligent caching for stock price data to minimize API calls and
work around rate limits (especially Alpha Vantage's 5 calls/minute limit).
"""

import os
import json
import time
from datetime import datetime, timedelta
from pathlib import Path


class StockDataCache:
    """
    Manages caching of stock price data with TTL (time-to-live).

    Uses file-based caching for persistence across server restarts.
    """

    def __init__(self, cache_dir=None, ttl_hours=24):
        """
        Initialize the cache manager.

        Args:
            cache_dir: Directory to store cache files (default: backend/cache/)
            ttl_hours: Time-to-live in hours (default: 24)
        """
        if cache_dir is None:
            cache_dir = os.path.join(os.path.dirname(__file__), '..', 'cache')

        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.ttl_seconds = ttl_hours * 3600

    def _get_cache_key(self, ticker, start_date, end_date):
        """Generate a unique cache key for a ticker and date range."""
        return f"{ticker}_{start_date}_{end_date}"

    def _get_cache_path(self, cache_key):
        """Get the file path for a cache key."""
        return self.cache_dir / f"{cache_key}.json"

    def get(self, ticker, start_date, end_date):
        """
        Retrieve cached data if available and not expired.

        Args:
            ticker: Stock ticker symbol
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)

        Returns:
            tuple: (price_data, original_source) or (None, None) if not in cache or expired
        """
        cache_key = self._get_cache_key(ticker, start_date, end_date)
        cache_path = self._get_cache_path(cache_key)

        if not cache_path.exists():
            return None, None

        try:
            with open(cache_path, 'r') as f:
                cached_data = json.load(f)

            # Check if cache is expired
            cached_time = cached_data.get('timestamp', 0)
            if time.time() - cached_time > self.ttl_seconds:
                # Cache expired, delete it
                cache_path.unlink()
                return None, None

            original_source = cached_data.get('source', 'unknown')
            return cached_data.get('data'), original_source

        except (json.JSONDecodeError, KeyError, OSError):
            # Corrupted cache, delete it
            if cache_path.exists():
                cache_path.unlink()
            return None, None

    def set(self, ticker, start_date, end_date, data, source='unknown'):
        """
        Store data in cache with original source information.

        Args:
            ticker: Stock ticker symbol
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            data: Price data to cache (list of dicts with date/close)
            source: Original data provider (yfinance, alpha_vantage, etc.)
        """
        cache_key = self._get_cache_key(ticker, start_date, end_date)
        cache_path = self._get_cache_path(cache_key)

        cache_entry = {
            'timestamp': time.time(),
            'ticker': ticker,
            'start_date': start_date,
            'end_date': end_date,
            'source': source,  # Store original source
            'data': data
        }

        try:
            with open(cache_path, 'w') as f:
                json.dump(cache_entry, f)
        except OSError as e:
            print(f"Warning: Failed to write cache for {ticker}: {e}")

    def clear_expired(self):
        """Remove all expired cache entries."""
        current_time = time.time()

        for cache_file in self.cache_dir.glob("*.json"):
            try:
                with open(cache_file, 'r') as f:
                    cached_data = json.load(f)

                cached_time = cached_data.get('timestamp', 0)
                if current_time - cached_time > self.ttl_seconds:
                    cache_file.unlink()

            except (json.JSONDecodeError, KeyError, OSError):
                # Corrupted file, delete it
                cache_file.unlink()

    def clear_all(self):
        """Remove all cached data."""
        for cache_file in self.cache_dir.glob("*.json"):
            cache_file.unlink()


# Global cache instance
_cache = StockDataCache()


def get_cache():
    """Get the global cache instance."""
    return _cache
