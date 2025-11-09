import yfinance as yf
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
import os

# Constants
RISK_FREE_RATE = 0.04  # 4% annual risk-free rate
SHARPE_THRESHOLD_LOW = 0.5
SHARPE_THRESHOLD_HIGH = 1.0
DAYS_IN_YEAR = 252
LOOKBACK_DAYS = 365

# 1. Input Data Model
class Portfolio(BaseModel):
    tickers: List[str]
    weights: List[float]

# 2. FastAPI App Initialization
app = FastAPI()

# 3. CORS Configuration
# Allow localhost for development, Vercel domains, and Render domains for production
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"(http://localhost:\d+|https://.*\.vercel\.app|https://.*\.onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper Functions
def validate_portfolio_inputs(tickers: List[str], weights: List[float]):
    """
    Validates portfolio input data.
    
    Args:
        tickers: List of stock ticker symbols
        weights: List of portfolio weights
        
    Raises:
        ValueError: If inputs are invalid
    """
    if not tickers or len(tickers) == 0:
        raise ValueError("At least one ticker is required.")
    
    if len(tickers) != len(weights):
        raise ValueError("The number of tickers and weights must be the same.")
    
    if any(w < 0 for w in weights):
        raise ValueError("Weights cannot be negative.")
    
    if any(w > 1 for w in weights):
        raise ValueError("Individual weights cannot exceed 1.0.")
    
    if not np.isclose(sum(weights), 1.0, atol=0.01):
        raise ValueError(f"The sum of weights must be 1.0 (currently {sum(weights):.4f}).")


# 4. Analysis Endpoint
@app.post("/analyze_portfolio")
async def analyze_portfolio(portfolio: Portfolio, x_data_source: str = Header(None, alias="X-Data-Source"), x_alphavantage_key: str = Header(None, alias="X-AlphaVantage-Key")):
    """
    Analyzes a portfolio of stocks.
    - Fetches 1 year of daily price data.
    - Calculates daily returns, expected annual return, volatility, and Sharpe ratio.
    - Returns these metrics for each ticker and for the overall portfolio.
    """
    # Validate inputs
    try:
        validate_portfolio_inputs(portfolio.tickers, portfolio.weights)
    except ValueError as e:
        return {"error": str(e)}

    # Fetch data
    from core.data_adapter import get_provider_from_env, DataProvider

    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=LOOKBACK_DAYS)).strftime('%Y-%m-%d')

    try:
        if x_data_source:
            provider = DataProvider(source=x_data_source, api_key=x_alphavantage_key)
        else:
            provider = get_provider_from_env()

        print(f"Using data source: {provider.source_name}")
        prices_data = provider.get_prices(portfolio.tickers, start_date, end_date)

        # Fallback logic - try alternative source if primary fails
        if not prices_data or len(prices_data) != len(portfolio.tickers):
            print(f"Primary source failed or returned incomplete data. Attempting fallback...")
            if provider.source_name == 'alpha_vantage':
                print("Alpha Vantage failed, falling back to yfinance.")
                fallback_provider = DataProvider(source='yfinance')
                prices_data = fallback_provider.get_prices(portfolio.tickers, start_date, end_date)
            elif provider.source_name == 'yfinance':
                print("yfinance failed, falling back to Alpha Vantage.")
                api_key = x_alphavantage_key or os.getenv("ALPHAVANTAGE_API_KEY")
                if api_key:
                    fallback_provider = DataProvider(source='alpha_vantage', api_key=api_key)
                    prices_data = fallback_provider.get_prices(portfolio.tickers, start_date, end_date)
            
            if not prices_data or len(prices_data) == 0:
                return {"error": "Could not download data from any source. Please check ticker symbols and try again."}

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
    for ticker in portfolio.tickers:
        ticker_returns = returns[ticker] if len(portfolio.tickers) > 1 else returns
        expected_return = ticker_returns.mean() * DAYS_IN_YEAR
        volatility = ticker_returns.std() * np.sqrt(DAYS_IN_YEAR)
        sharpe_ratio = (expected_return - RISK_FREE_RATE) / volatility if volatility != 0 else 0
        individual_metrics[ticker] = {
            "expected_annual_return": expected_return,
            "annual_volatility": volatility,
            "sharpe_ratio": sharpe_ratio
        }

    # Portfolio metrics
    portfolio_return = np.sum(returns.mean() * portfolio.weights) * DAYS_IN_YEAR
    portfolio_volatility = np.sqrt(
        np.dot(
            np.array(portfolio.weights).T,
            np.dot(returns.cov() * DAYS_IN_YEAR, portfolio.weights)
        )
    )
    portfolio_sharpe_ratio = (portfolio_return - RISK_FREE_RATE) / portfolio_volatility if portfolio_volatility != 0 else 0

    # Generate summary
    portfolio_metrics_dict = {
        "expected_annual_return": portfolio_return,
        "annual_volatility": portfolio_volatility,
        "sharpe_ratio": portfolio_sharpe_ratio
    }
    summary = generate_summary(portfolio_metrics_dict, portfolio)

    # Calculate investment horizons (cumulative returns using CAGR)
    horizons = {
        "1y": portfolio_return,  # 1 year is just the annual return
        "3y": (1 + portfolio_return) ** 3 - 1,  # 3-year cumulative
        "5y": (1 + portfolio_return) ** 5 - 1,  # 5-year cumulative
    }

    return {
        "individual_metrics": individual_metrics,
        "portfolio_metrics": {
            "expected_annual_return": portfolio_return,
            "annual_volatility": portfolio_volatility,
            "sharpe_ratio": portfolio_sharpe_ratio,
            "horizons": horizons
        },
        "weights": portfolio.weights,  # Add weights for frontend chart
        "tickers": portfolio.tickers,   # Add tickers for reference
        "summary": summary
    }

def generate_summary(metrics, portfolio):
    sharpe = metrics.get('sharpe_ratio', 0)
    
    if sharpe < 0.5:
        risk_profile = "a higher risk for the reward"
    elif 0.5 <= sharpe < 1.0:
        risk_profile = "a moderate risk-adjusted profile"
    else:
        risk_profile = "an efficient risk-adjusted profile"

    summary = f"The portfolio has {risk_profile}."

    top_ticker_index = np.argmax(portfolio.weights)
    top_ticker = portfolio.tickers[top_ticker_index]
    top_weight = portfolio.weights[top_ticker_index]

    if top_weight > 0.4:
        summary += f" It is also concentrated in {top_ticker}, representing {top_weight * 100:.0f}% of the portfolio."

    return summary


# 5. Main execution block
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
