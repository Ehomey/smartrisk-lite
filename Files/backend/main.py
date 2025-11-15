"""
main.py

SmartRisk Lite Backend API

FastAPI-based REST API for portfolio risk analysis and Monte Carlo projections.
Provides endpoints for analyzing portfolio metrics, fetching asset data, and
generating probabilistic return scenarios.

Key Features:
- Multi-source data fetching (Yahoo Finance, Alpha Vantage) with intelligent caching
- Portfolio risk metrics (Sharpe ratio, volatility, expected returns)
- Monte Carlo simulations for probabilistic projections
- Graceful handling of partial data failures
- Rate limit workarounds for free-tier APIs

Endpoints:
- GET /popular_stocks: Paginated list of curated stocks, ETFs, and crypto
- POST /analyze_portfolio: Comprehensive portfolio analysis with projections
- GET /search_assets: Live ticker lookup via yfinance
"""

import yfinance as yf
import numpy as np
import pandas as pd
import re
from datetime import datetime, timedelta
from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
import json
from core.monte_carlo import run_monte_carlo_simulation, calculate_portfolio_historical_cagr
from core.cache_manager import get_cache

# Constants - Financial calculations
RISK_FREE_RATE = 0.04  # 4% annual risk-free rate (US Treasury baseline)
SHARPE_THRESHOLD_LOW = 0.5  # Below this is considered poor risk-adjusted return
SHARPE_THRESHOLD_HIGH = 1.0  # Above this is considered good risk-adjusted return
DAYS_IN_YEAR = 252  # Trading days in a typical year
LOOKBACK_DAYS = 365  # Historical data window for analysis

# Constants - File paths and configuration
POPULAR_STOCKS_PATH = os.path.join(os.path.dirname(__file__), 'data', 'popular_stocks.json')
ALLOWED_PATH_COUNTS = [5000, 10000, 20000]  # Valid Monte Carlo simulation path counts

# Constants - Security
MAX_PORTFOLIO_SIZE = 50  # Maximum number of assets in a portfolio
MIN_WEIGHT_PRECISION = 0.0001  # Minimum weight precision (0.01%)
TICKER_PATTERN = re.compile(r'^[A-Z0-9.\-]{1,10}$')  # Valid ticker format


# Pydantic Models
class Portfolio(BaseModel):
    """
    Portfolio input model for analysis requests.

    Attributes:
        tickers: List of stock ticker symbols (e.g., ['AAPL', 'MSFT', 'GOOG'])
        weights: List of portfolio weights (must sum to 1.0)
        num_paths: Optional Monte Carlo path count (default: 5000)
    """
    tickers: List[str]
    weights: List[float]
    num_paths: Optional[int] = None
    initial_investment: Optional[float] = 10000.0
    monthly_contribution: Optional[float] = 0.0
    contribution_frequency: Optional[str] = "monthly"  # "monthly", "quarterly", "annually"


# FastAPI App Initialization
app = FastAPI(
    title="SmartRisk Lite API",
    description="Portfolio risk analysis and Monte Carlo projection engine",
    version="0.1.0"
)

# CORS Configuration - Explicit Whitelist for Security
# Environment-aware: permissive in development, restrictive in production
ENV = os.getenv("ENV", "development")

if ENV == "production":
    # Production: Explicit whitelist of allowed origins
    ALLOWED_ORIGINS = [
        "https://smartrisk-lite.vercel.app",  # Production frontend
        "https://smartrisk-lite-*.vercel.app",  # Vercel preview deployments
        os.getenv("FRONTEND_URL")  # Additional origin from environment
    ]
    # Filter out None values
    ALLOWED_ORIGINS = [origin for origin in ALLOWED_ORIGINS if origin]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST"],  # Only needed methods
        allow_headers=["Content-Type", "X-Data-Source", "X-AlphaVantage-Key"],
    )
else:
    # Development: Allow localhost on any port
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"http://localhost:\d+",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    """
    Add security headers to all responses.

    Headers:
    - Strict-Transport-Security: Enforce HTTPS for 1 year
    - X-Content-Type-Options: Prevent MIME sniffing
    - X-Frame-Options: Prevent clickjacking
    - X-XSS-Protection: Enable browser XSS filter
    - Content-Security-Policy: Restrict resource loading
    """
    response = await call_next(request)

    # Only add HSTS in production (requires HTTPS)
    if ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'"

    return response


# ========== Helper Functions ==========
def fetch_prices_with_cache_and_hybrid(tickers, start_date, end_date, primary_source='yfinance', api_key=None):
    """
    Intelligent data fetching with caching and hybrid source strategy.

    Strategy:
    1. Check cache for all tickers first
    2. For uncached tickers:
       - If Alpha Vantage: fetch first 5, use yfinance for rest (rate limit workaround)
       - If yfinance: fetch all remaining
    3. Cache all newly fetched data
    4. Return combined results

    Args:
        tickers: List of ticker symbols
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        primary_source: 'yfinance' or 'alpha_vantage'
        api_key: Alpha Vantage API key (if needed)

    Returns:
        dict: {ticker: [{"date": "YYYY-MM-DD", "close": price}, ...]}
    """
    from core.data_adapter import DataProvider

    cache = get_cache()
    prices_data = {}
    source_info = {}  # Track data source for each ticker
    uncached_tickers = []

    # Step 1: Check cache
    print(f"Checking cache for {len(tickers)} ticker(s)...")
    for ticker in tickers:
        cached_data, original_source = cache.get(ticker, start_date, end_date)
        if cached_data:
            prices_data[ticker] = cached_data
            # Format source as "OriginalSource (Cached)"
            display_source = f"{original_source} (cached)" if original_source != 'unknown' else "cache"
            source_info[ticker] = {"source": display_source, "cached": True}
            print(f"  ✓ {ticker}: Found in cache (original source: {original_source})")
        else:
            uncached_tickers.append(ticker)
            print(f"  ✗ {ticker}: Not in cache")

    # Step 2: Fetch uncached data
    if uncached_tickers:
        print(f"Fetching {len(uncached_tickers)} uncached ticker(s)...")

        if primary_source == 'alpha_vantage' and len(uncached_tickers) > 5:
            # Hybrid approach for Alpha Vantage rate limits
            print(f"⚠ Alpha Vantage rate limit: Fetching first 5 with AV, rest with yfinance")

            # Fetch first 5 with Alpha Vantage
            av_tickers = uncached_tickers[:5]
            yf_tickers = uncached_tickers[5:]

            try:
                av_provider = DataProvider(source='alpha_vantage', api_key=api_key)
                av_data = av_provider.get_prices(av_tickers, start_date, end_date)
                prices_data.update(av_data)

                # Cache Alpha Vantage data
                for ticker, data in av_data.items():
                    cache.set(ticker, start_date, end_date, data, source='alpha_vantage')
                    source_info[ticker] = {"source": "alpha_vantage", "cached": False}
                    print(f"  ✓ {ticker}: Fetched from Alpha Vantage & cached")
            except Exception as e:
                print(f"  ✗ Alpha Vantage fetch failed: {e}")
                # Add AV tickers back to yfinance fallback list
                yf_tickers = uncached_tickers

            # Fetch remaining with yfinance
            if yf_tickers:
                try:
                    yf_provider = DataProvider(source='yfinance')
                    yf_data = yf_provider.get_prices(yf_tickers, start_date, end_date)
                    prices_data.update(yf_data)

                    # Cache yfinance data
                    for ticker, data in yf_data.items():
                        cache.set(ticker, start_date, end_date, data, source='yfinance')
                        source_info[ticker] = {"source": "yfinance", "cached": False}
                        print(f"  ✓ {ticker}: Fetched from yfinance & cached")
                except Exception as e:
                    print(f"  ✗ yfinance fallback failed: {e}")

        else:
            # Use primary source for all (no rate limit issues)
            try:
                provider = DataProvider(source=primary_source, api_key=api_key)
                new_data = provider.get_prices(uncached_tickers, start_date, end_date)
                prices_data.update(new_data)

                # Cache fetched data
                for ticker, data in new_data.items():
                    cache.set(ticker, start_date, end_date, data, source=primary_source)
                    source_info[ticker] = {"source": primary_source, "cached": False}
                    print(f"  ✓ {ticker}: Fetched from {primary_source} & cached")
            except Exception as e:
                print(f"  ✗ {primary_source} fetch failed: {e}")

                # Fallback to yfinance if primary failed
                if primary_source != 'yfinance':
                    try:
                        yf_provider = DataProvider(source='yfinance')
                        yf_data = yf_provider.get_prices(uncached_tickers, start_date, end_date)
                        prices_data.update(yf_data)

                        for ticker, data in yf_data.items():
                            cache.set(ticker, start_date, end_date, data, source='yfinance')
                            source_info[ticker] = {"source": "yfinance (fallback)", "cached": False}
                            print(f"  ✓ {ticker}: Fetched from yfinance (fallback) & cached")
                    except Exception as e2:
                        print(f"  ✗ yfinance fallback also failed: {e2}")

    # Final check: if any tickers are still missing, try fetching them with yfinance
    missing_tickers = [t for t in tickers if t not in prices_data]
    if missing_tickers and primary_source != 'yfinance':
        print(f"\n⚠ {len(missing_tickers)} ticker(s) still missing after primary fetch. Attempting yfinance fallback...")
        try:
            yf_provider = DataProvider(source='yfinance')
            yf_data = yf_provider.get_prices(missing_tickers, start_date, end_date)

            for ticker, data in yf_data.items():
                prices_data[ticker] = data
                cache.set(ticker, start_date, end_date, data, source='yfinance')
                source_info[ticker] = {"source": "yfinance (rate limit fallback)", "cached": False}
                print(f"  ✓ {ticker}: Fetched from yfinance (rate limit fallback) & cached")
        except Exception as e:
            print(f"  ✗ yfinance fallback failed: {e}")

    print(f"Final result: {len(prices_data)}/{len(tickers)} tickers successfully fetched")
    return prices_data, source_info


def validate_portfolio_inputs(tickers: List[str], weights: List[float], initial_investment: float = 10000.0,
                            monthly_contribution: float = 0.0, contribution_frequency: str = "monthly") -> None:
    """
    Validates portfolio input data with comprehensive security checks.

    Performs validation to prevent:
    - Denial of service (excessive portfolio sizes)
    - Invalid ticker formats (injection attempts)
    - Malformed weight data
    - Duplicate tickers
    - Precision abuse
    - Invalid contribution parameters

    Args:
        tickers: List of stock ticker symbols (1-10 chars, alphanumeric + . -)
        weights: List of portfolio weights (must sum to 1.0)
        initial_investment: Initial investment amount (must be positive)
        monthly_contribution: Periodic contribution amount (must be non-negative)
        contribution_frequency: Frequency of contributions ("monthly", "quarterly", "annually")

    Raises:
        ValueError: If any validation check fails
    """
    # Portfolio size limits (prevent resource exhaustion)
    if not tickers or len(tickers) == 0:
        raise ValueError("At least one ticker is required.")

    if len(tickers) > MAX_PORTFOLIO_SIZE:
        raise ValueError(f"Portfolio too large. Maximum {MAX_PORTFOLIO_SIZE} assets allowed.")

    if len(tickers) != len(weights):
        raise ValueError(f"Ticker/weight mismatch: {len(tickers)} tickers, {len(weights)} weights.")

    # Validate individual tickers and weights
    for i, (ticker, weight) in enumerate(zip(tickers, weights)):
        # Ticker format validation (security: prevent injection)
        if not isinstance(ticker, str):
            raise ValueError(f"Ticker at position {i+1} must be a string.")

        if not TICKER_PATTERN.match(ticker):
            raise ValueError(
                f"Invalid ticker format: '{ticker}'. "
                "Use 1-10 uppercase letters, numbers, dots, or hyphens only."
            )

        # Weight type validation
        if not isinstance(weight, (int, float)):
            raise ValueError(f"Weight for {ticker} must be a number, got {type(weight).__name__}.")

        # Weight range validation
        if weight < 0:
            raise ValueError(f"Weight for {ticker} cannot be negative ({weight}).")

        if weight > 1.0:
            raise ValueError(f"Weight for {ticker} cannot exceed 1.0 ({weight}).")

        # Precision validation (prevent precision abuse)
        if weight > 0 and weight < MIN_WEIGHT_PRECISION:
            raise ValueError(
                f"Weight for {ticker} too small ({weight}). "
                f"Minimum precision is {MIN_WEIGHT_PRECISION*100}%."
            )

    # Sum validation
    weight_sum = sum(weights)
    if not np.isclose(weight_sum, 1.0, atol=0.01):
        raise ValueError(f"Weights must sum to 1.0 (currently {weight_sum:.4f}).")

    # Duplicate detection (security: prevent confusion attacks)
    unique_tickers = set(tickers)
    if len(unique_tickers) != len(tickers):
        duplicates = [t for t in unique_tickers if tickers.count(t) > 1]
        raise ValueError(f"Duplicate tickers not allowed: {', '.join(duplicates)}")

    # Contribution parameter validation
    if initial_investment <= 0:
        raise ValueError("Initial investment must be greater than 0.")

    if monthly_contribution < 0:
        raise ValueError("Monthly contribution cannot be negative.")

    valid_frequencies = ["monthly", "quarterly", "annually"]
    if contribution_frequency not in valid_frequencies:
        raise ValueError(f"Contribution frequency must be one of {valid_frequencies}.")


# ========== API Endpoints ==========

@app.get("/popular_stocks")
async def get_popular_stocks(
    asset_type: Optional[str] = Query(None, alias="asset_type"),
    sector: Optional[str] = None,
    page: int = 1,
    limit: int = 60,
):
    """
    Retrieve paginated list of curated stocks, ETFs, and crypto assets.

    This endpoint serves a pre-curated list of 236 popular assets across
    different asset classes and sectors. Supports filtering and pagination.

    Query Parameters:
        asset_type: Filter by asset class ('Stock', 'ETF', 'Crypto')
        sector: Filter by sector (e.g., 'Technology', 'Healthcare')
        page: Page number for pagination (default: 1)
        limit: Items per page (default: 60, max: 200)

    Returns:
        dict: {
            'items': List of asset objects with ticker, name, sector, assetClass
            'total': Total count matching filters
            'asset_classes': Available asset class options
            'sectors': Available sector options
            'page': Current page number
            'limit': Items per page
        }
    """
    try:
        with open(POPULAR_STOCKS_PATH, 'r') as f:
            stocks = json.load(f)
        
        filtered = stocks

        if asset_type:
            filtered = [
                stock for stock in filtered
                if stock.get('assetClass', '').lower() == asset_type.lower()
            ]

        if sector:
            filtered = [
                stock for stock in filtered
                if stock.get('sector', '').lower() == sector.lower()
            ]

        all_asset_classes = sorted({stock.get('assetClass', 'Unknown') for stock in stocks})
        all_sectors = sorted({stock.get('sector', 'Unknown') for stock in stocks})

        limit = max(1, min(limit, 200))
        page = max(1, page)
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paged = filtered[start_index:end_index]

        return {
            "items": paged,
            "total": len(filtered),
            "asset_classes": all_asset_classes,
            "sectors": all_sectors,
            "page": page,
            "limit": limit
        }
    except FileNotFoundError:
        return {"error": "Popular stocks file not found."}
    except Exception as e:
        return {"error": f"An error occurred: {e}"}


@app.post("/analyze_portfolio")
async def analyze_portfolio(
    portfolio: Portfolio,
    x_data_source: str = Header(None, alias="X-Data-Source"),
    x_alphavantage_key: str = Header(None, alias="X-AlphaVantage-Key")
):
    """
    Perform comprehensive portfolio risk analysis with Monte Carlo projections.

    This is the primary analysis endpoint that:
    1. Fetches 1 year of historical price data (with intelligent caching)
    2. Calculates risk/return metrics for each asset and the portfolio
    3. Generates Monte Carlo simulations for probabilistic projections
    4. Provides AI-generated natural language summary
    5. Handles partial failures gracefully (adjusts weights if some tickers fail)

    Request Body:
        portfolio: {
            'tickers': List of ticker symbols (e.g., ['AAPL', 'MSFT'])
            'weights': List of weights summing to 1.0 (e.g., [0.6, 0.4])
            'num_paths': Optional Monte Carlo path count (5000/10000/20000)
        }

    Headers (Optional):
        X-Data-Source: 'yfinance' or 'alpha_vantage' (default: yfinance)
        X-AlphaVantage-Key: API key if using Alpha Vantage

    Returns:
        dict: {
            'individual_metrics': Per-ticker risk/return stats
            'portfolio_metrics': Aggregated portfolio stats
            'projections': Monte Carlo percentile projections (P10/P50/P90)
            'summary': Natural language analysis
            'data_sources': Cache/source info for each ticker
            'warning': Optional message for partial failures
            'tickers': Final ticker list (may differ if failures occurred)
            'weights': Final weights (normalized if failures occurred)
        }

    Error Responses:
        400: Invalid input (weights don't sum to 1.0, etc.)
        500: Data fetch failures, calculation errors
    """
    # Validate inputs
    try:
        validate_portfolio_inputs(
            portfolio.tickers,
            portfolio.weights,
            portfolio.initial_investment,
            portfolio.monthly_contribution,
            portfolio.contribution_frequency
        )
    except ValueError as e:
        return {"error": str(e)}

    simulation_paths = portfolio.num_paths
    if simulation_paths is not None and simulation_paths not in ALLOWED_PATH_COUNTS:
        return {"error": f"num_paths must be one of {ALLOWED_PATH_COUNTS}. Received {simulation_paths}."}

    # Fetch data with caching and hybrid source strategy
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=LOOKBACK_DAYS)).strftime('%Y-%m-%d')

    try:
        # Determine primary data source
        if x_data_source:
            primary_source = x_data_source
            api_key = x_alphavantage_key
        else:
            from core.data_adapter import get_provider_from_env
            provider = get_provider_from_env()
            primary_source = provider.source_name
            api_key = os.getenv("ALPHAVANTAGE_API_KEY") if primary_source == 'alpha_vantage' else None

        print(f"Using primary data source: {primary_source}")

        # Use intelligent caching and hybrid fetching
        prices_data, source_info = fetch_prices_with_cache_and_hybrid(
            tickers=portfolio.tickers,
            start_date=start_date,
            end_date=end_date,
            primary_source=primary_source,
            api_key=api_key
        )

        # Check if we got data for all tickers
        if not prices_data or len(prices_data) == 0:
            error_msg = f"Could not download data from any source. Please check ticker symbols ({', '.join(portfolio.tickers)}) and try again."
            if primary_source == 'alpha_vantage':
                error_msg += " Note: Alpha Vantage has a limit of 25 API calls per day. You may have exceeded this limit. Try using Yahoo Finance instead."
            return {"error": error_msg}

        # Handle partial failures - proceed with available tickers
        warning_message = None
        adjusted_tickers = portfolio.tickers
        adjusted_weights = portfolio.weights

        if len(prices_data) != len(portfolio.tickers):
            missing_tickers = [t for t in portfolio.tickers if t not in prices_data]
            available_tickers = [t for t in portfolio.tickers if t in prices_data]

            # Calculate adjusted weights (normalize remaining weights to sum to 1.0)
            available_indices = [i for i, t in enumerate(portfolio.tickers) if t in prices_data]
            original_weights_sum = sum(portfolio.weights[i] for i in available_indices)

            if original_weights_sum > 0:
                adjusted_weights = [portfolio.weights[i] / original_weights_sum for i in available_indices]
                adjusted_tickers = available_tickers

                warning_message = f"⚠️ Could not fetch data for: {', '.join(missing_tickers)}. Analysis proceeds with remaining {len(available_tickers)} asset(s). Weights have been adjusted proportionally."
                if primary_source == 'alpha_vantage':
                    warning_message += " This may be due to Alpha Vantage rate limits or invalid ticker symbols."

                print(f"\n⚠️ WARNING: Missing tickers: {missing_tickers}")
                print(f"Proceeding with {len(available_tickers)} tickers: {available_tickers}")
                print(f"Adjusted weights: {adjusted_weights}")
            else:
                error_msg = f"Could not fetch data for tickers: {', '.join(missing_tickers)}. Cannot proceed with analysis."
                return {"error": error_msg}

        # Convert to DataFrame
        df_list = []
        for ticker, values in prices_data.items():
            df = pd.DataFrame(values)
            df['date'] = pd.to_datetime(df['date'])
            df = df.set_index('date')
            df.rename(columns={'close': ticker}, inplace=True)
            df_list.append(df)
        
        data = pd.concat(df_list, axis=1).dropna()

    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}


    # Calculate daily returns
    returns = data.pct_change().dropna()

    # Individual metrics
    individual_metrics = {}
    for ticker in adjusted_tickers:
        if len(adjusted_tickers) > 1:
            ticker_returns = returns[ticker]
        else:
            # Single stock: returns is already a Series for that one stock
            ticker_returns = returns[adjusted_tickers[0]]

        expected_return = float(ticker_returns.mean() * DAYS_IN_YEAR)
        volatility = float(ticker_returns.std() * np.sqrt(DAYS_IN_YEAR))
        sharpe_ratio = (expected_return - RISK_FREE_RATE) / volatility if volatility != 0 else 0
        individual_metrics[ticker] = {
            "expected_annual_return": expected_return,
            "annual_volatility": volatility,
            "sharpe_ratio": sharpe_ratio
        }

    # Portfolio metrics
    if len(adjusted_tickers) == 1:
        # Single stock: use the stock's metrics directly
        portfolio_return = individual_metrics[adjusted_tickers[0]]["expected_annual_return"]
        portfolio_volatility = individual_metrics[adjusted_tickers[0]]["annual_volatility"]
    else:
        # Multiple stocks: calculate weighted portfolio metrics
        portfolio_return = np.sum(returns.mean() * adjusted_weights) * DAYS_IN_YEAR
        portfolio_volatility = np.sqrt(
            np.dot(
                np.array(adjusted_weights).T,
                np.dot(returns.cov() * DAYS_IN_YEAR, adjusted_weights)
            )
        )
    portfolio_sharpe_ratio = (portfolio_return - RISK_FREE_RATE) / portfolio_volatility if portfolio_volatility != 0 else 0

    # Generate summary
    portfolio_metrics_dict = {
        "expected_annual_return": portfolio_return,
        "annual_volatility": portfolio_volatility,
        "sharpe_ratio": portfolio_sharpe_ratio
    }

    # Create a temporary portfolio object for summary generation
    class AdjustedPortfolio:
        def __init__(self, tickers, weights):
            self.tickers = tickers
            self.weights = weights

    adjusted_portfolio = AdjustedPortfolio(adjusted_tickers, adjusted_weights)
    summary = generate_summary(portfolio_metrics_dict, adjusted_portfolio)

    # Calculate historical CAGR from actual realized price data
    historical_cagr = calculate_portfolio_historical_cagr(data, adjusted_weights)

    # Run Monte Carlo simulation for probabilistic projections
    mc_results = run_monte_carlo_simulation(
        daily_returns=returns,
        weights=adjusted_weights,
        num_years=10,
        initial_value=portfolio.initial_investment,
        periodic_contribution=portfolio.monthly_contribution,
        contribution_frequency=portfolio.contribution_frequency,
        num_paths=simulation_paths
    )

    # Build projections object with CAGR and Monte Carlo results
    projections = {
        "cagr": historical_cagr,
        "years": mc_results['years'],
        "percentiles": mc_results['percentiles']
    }

    response = {
        "individual_metrics": individual_metrics,
        "portfolio_metrics": {
            "expected_annual_return": portfolio_return,
            "annual_volatility": portfolio_volatility,
            "sharpe_ratio": portfolio_sharpe_ratio
        },
        "projections": projections,
        "weights": adjusted_weights,  # Use adjusted weights
        "tickers": adjusted_tickers,   # Use adjusted tickers
        "summary": summary,
        "data_sources": source_info,  # Add data source information
        "contribution_settings": {
            "initial_investment": portfolio.initial_investment,
            "periodic_contribution": portfolio.monthly_contribution,
            "contribution_frequency": portfolio.contribution_frequency
        }
    }

    # Add warning if there were missing tickers
    if warning_message:
        response["warning"] = warning_message

    return response

@app.get("/search_assets")
async def search_assets(query: str):
    """
    Search for an asset by ticker symbol using live yfinance data.

    This endpoint enables users to add assets not in the curated list
    by performing a live lookup against Yahoo Finance's database.

    Query Parameters:
        query: Ticker symbol to search (e.g., 'AAPL', 'BTC-USD')

    Returns:
        dict: {
            'ticker': Normalized ticker symbol (uppercase)
            'name': Full company/asset name
            'sector': Sector or industry classification
            'assetClass': Detected asset type (Stock/ETF/Crypto)
            'source': Data provider ('yfinance')
        }

    Error Responses:
        400: Query parameter missing or empty
        404: Ticker not found or invalid
    """
    # Sanitize and validate ticker format (SECURITY: prevent injection/path traversal)
    ticker = query.strip().upper()

    if not ticker:
        raise HTTPException(status_code=400, detail="Query parameter is required.")

    # Validate ticker format before passing to yfinance
    if not TICKER_PATTERN.match(ticker):
        raise HTTPException(
            status_code=400,
            detail="Invalid ticker format. Use 1-10 uppercase letters, numbers, dots, or hyphens."
        )

    if len(ticker) > 10:
        raise HTTPException(status_code=400, detail="Ticker too long (maximum 10 characters).")

    try:
        # Fetch ticker metadata from yfinance
        yf_ticker = yf.Ticker(ticker)
        info = yf_ticker.info or {}
    except Exception as exc:
        # Log exception but don't expose internal details to user
        print(f"yfinance error for ticker '{ticker}': {exc}")
        raise HTTPException(status_code=404, detail=f"Ticker '{ticker}' not found.")

    if not info:
        raise HTTPException(status_code=404, detail=f"No data found for {ticker}")

    # Extract metadata with fallbacks
    name = info.get("shortName") or info.get("longName") or ticker
    sector = info.get("sector") or info.get("industry") or "Unknown"
    quote_type = (info.get("quoteType") or "").lower()

    # Classify asset type based on quote type and ticker format
    if ticker.endswith("-USD") or quote_type in {"cryptocurrency", "crypto"}:
        asset_class = "Crypto"
    elif quote_type == "etf":
        asset_class = "ETF"
    else:
        asset_class = "Stock"

    return {
        "ticker": ticker,
        "name": name,
        "sector": sector,
        "assetClass": asset_class,
        "source": "yfinance"
    }


def generate_summary(metrics: dict, portfolio) -> str:
    """
    Generate a natural language portfolio analysis summary.

    Synthesizes multiple dimensions of portfolio quality into a readable
    narrative for end users, covering:
    - Risk-adjusted performance (Sharpe ratio interpretation)
    - Return classification (conservative to aggressive)
    - Volatility assessment (low to high risk)
    - Diversification quality
    - Concentration warnings
    - Actionable recommendations

    Args:
        metrics: Dictionary with 'sharpe_ratio', 'expected_annual_return', 'annual_volatility'
        portfolio: Portfolio object with 'tickers' and 'weights' attributes

    Returns:
        str: Multi-sentence natural language summary
    """
    sharpe = metrics.get('sharpe_ratio', 0)
    expected_return = metrics.get('expected_annual_return', 0)
    volatility = metrics.get('annual_volatility', 0)

    # Risk-adjusted performance assessment (Sharpe ratio thresholds)
    if sharpe < 0:
        performance = "underperforming the risk-free rate"
        recommendation = "Consider reviewing your asset selection."
    elif sharpe < 0.5:
        performance = "showing poor risk-adjusted returns"
        recommendation = "Higher risk relative to expected returns."
    elif sharpe < 1.0:
        performance = "demonstrating moderate risk-adjusted returns"
        recommendation = "Acceptable performance with room for optimization."
    elif sharpe < 2.0:
        performance = "exhibiting strong risk-adjusted returns"
        recommendation = "Well-balanced risk and reward profile."
    else:
        performance = "achieving exceptional risk-adjusted returns"
        recommendation = "Excellent diversification and asset selection."

    # Return classification
    if expected_return < 0.05:
        return_level = "conservative"
    elif expected_return < 0.10:
        return_level = "moderate"
    elif expected_return < 0.15:
        return_level = "growth-oriented"
    else:
        return_level = "aggressive"

    # Volatility assessment
    if volatility < 0.10:
        risk_level = "low"
    elif volatility < 0.20:
        risk_level = "moderate"
    elif volatility < 0.30:
        risk_level = "elevated"
    else:
        risk_level = "high"

    # Build comprehensive summary
    summary = f"This portfolio is {performance} with a Sharpe ratio of {sharpe:.2f}. "
    summary += f"It targets a {return_level} expected return of {expected_return*100:.1f}% annually, "
    summary += f"with {risk_level} volatility at {volatility*100:.1f}%. "

    # Concentration analysis
    num_holdings = len(portfolio.tickers)
    top_ticker_index = np.argmax(portfolio.weights)
    top_ticker = portfolio.tickers[top_ticker_index]
    top_weight = portfolio.weights[top_ticker_index]

    if num_holdings == 1:
        summary += f"The portfolio consists of a single holding ({top_ticker}), offering no diversification benefit. "
    elif num_holdings <= 3:
        summary += f"With only {num_holdings} holdings, diversification is limited. "
    elif num_holdings <= 10:
        summary += f"The portfolio contains {num_holdings} holdings, providing reasonable diversification. "
    else:
        summary += f"With {num_holdings} holdings, the portfolio benefits from strong diversification. "

    if top_weight > 0.5:
        summary += f"⚠️ Highly concentrated in {top_ticker} ({top_weight*100:.0f}%), increasing single-asset risk."
    elif top_weight > 0.3:
        summary += f"Largest position is {top_ticker} ({top_weight*100:.0f}%)."

    # Add recommendation
    summary += f" {recommendation}"

    return summary


# 5. Main execution block
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
