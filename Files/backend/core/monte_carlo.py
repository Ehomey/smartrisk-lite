"""
Monte Carlo Portfolio Projection Module

Generates probabilistic portfolio value projections using historical return distributions.
Respects the observed mean vector and covariance matrix for multi-asset portfolios.
"""

import numpy as np
import os


def run_monte_carlo_simulation(
    daily_returns,
    weights,
    num_years=10,
    num_paths=None,
    initial_value=10000
):
    """
    Run Monte Carlo simulation for portfolio projections.

    Args:
        daily_returns (pd.DataFrame): DataFrame of daily returns for each asset (rows=dates, cols=tickers)
        weights (np.array): Portfolio weights for each asset
        num_years (int): Number of years to project forward (default: 10)
        num_paths (int): Number of Monte Carlo paths to simulate (default: from env or 5000)
        initial_value (float): Starting portfolio value for projections (default: 10000)

    Returns:
        dict: {
            'years': [1, 2, ..., num_years],
            'percentiles': {
                'p10': [...],
                'p50': [...],
                'p90': [...],
                'mean': [...]
            }
        }
    """
    # Get number of paths from environment variable or use default
    if num_paths is None:
        num_paths = int(os.getenv('MC_PATH_COUNT', 5000))

    # Constants
    DAYS_IN_YEAR = 252
    total_days = DAYS_IN_YEAR * num_years

    # Calculate historical statistics
    mean_returns = daily_returns.mean().values  # Mean daily return for each asset
    cov_matrix = daily_returns.cov().values     # Covariance matrix of daily returns

    # Convert weights to numpy array if needed
    weights_array = np.array(weights)

    # Generate correlated random returns
    # Use multivariate normal distribution to respect covariance structure
    np.random.seed(42)  # For reproducibility in testing; remove in production if desired

    # For single asset, use simpler univariate approach
    if len(weights) == 1:
        mean_return = mean_returns[0]
        std_return = np.sqrt(cov_matrix[0, 0])

        # Generate random returns: shape (num_paths, total_days)
        simulated_returns = np.random.normal(
            loc=mean_return,
            scale=std_return,
            size=(num_paths, total_days)
        )
    else:
        # Multi-asset: generate correlated returns for each asset
        # Shape: (total_days, num_paths, num_assets)
        simulated_asset_returns = np.random.multivariate_normal(
            mean=mean_returns,
            cov=cov_matrix,
            size=(total_days, num_paths)
        )

        # Calculate portfolio returns by weighting: (total_days, num_paths)
        simulated_returns = np.dot(simulated_asset_returns, weights_array).T

    # Convert returns to portfolio values
    # Start with initial_value and compound daily returns
    # Shape: (num_paths, total_days + 1) - includes initial value at t=0
    portfolio_values = np.zeros((num_paths, total_days + 1))
    portfolio_values[:, 0] = initial_value

    # Compound returns: V(t) = V(t-1) * (1 + r(t))
    for day in range(total_days):
        portfolio_values[:, day + 1] = portfolio_values[:, day] * (1 + simulated_returns[:, day])

    # Extract values at each year-end
    years = list(range(1, num_years + 1))
    percentiles = {
        'p10': [],
        'p50': [],
        'p90': [],
        'mean': []
    }

    for year in years:
        day_index = year * DAYS_IN_YEAR  # End of year (252, 504, 756, ...)
        year_end_values = portfolio_values[:, day_index]

        # Calculate percentiles and mean
        percentiles['p10'].append(float(np.percentile(year_end_values, 10)))
        percentiles['p50'].append(float(np.percentile(year_end_values, 50)))
        percentiles['p90'].append(float(np.percentile(year_end_values, 90)))
        percentiles['mean'].append(float(np.mean(year_end_values)))

    return {
        'years': years,
        'percentiles': percentiles
    }


def calculate_historical_cagr(price_data):
    """
    Calculate the realized Compound Annual Growth Rate (CAGR) from historical price data.

    Args:
        price_data (pd.DataFrame): DataFrame of historical prices (rows=dates, cols=tickers)
                                   Assumes data is sorted chronologically with oldest first

    Returns:
        float: Annualized CAGR as a decimal (e.g., 0.115 for 11.5%)
    """
    # Get first and last values
    initial_value = price_data.iloc[0].mean()  # Average of all tickers at start
    final_value = price_data.iloc[-1].mean()   # Average of all tickers at end

    # Calculate number of years in the data
    num_days = len(price_data)
    num_years = num_days / 252.0  # Convert trading days to years

    # CAGR formula: (final_value / initial_value) ^ (1 / num_years) - 1
    if initial_value <= 0 or final_value <= 0 or num_years <= 0:
        return 0.0

    cagr = (final_value / initial_value) ** (1.0 / num_years) - 1.0

    return float(cagr)


def calculate_portfolio_historical_cagr(price_data, weights):
    """
    Calculate the realized CAGR for a weighted portfolio from historical price data.

    Args:
        price_data (pd.DataFrame): DataFrame of historical prices (rows=dates, cols=tickers)
        weights (list): Portfolio weights for each ticker

    Returns:
        float: Annualized CAGR as a decimal (e.g., 0.115 for 11.5%)
    """
    # Normalize prices to start at 1.0 for each asset
    normalized_prices = price_data / price_data.iloc[0]

    # Calculate weighted portfolio value over time
    weights_array = np.array(weights)
    portfolio_values = normalized_prices.dot(weights_array)

    # Get initial and final portfolio values
    initial_value = portfolio_values.iloc[0]  # Should be 1.0
    final_value = portfolio_values.iloc[-1]

    # Calculate number of years
    num_days = len(price_data)
    num_years = num_days / 252.0

    # CAGR formula
    if initial_value <= 0 or final_value <= 0 or num_years <= 0:
        return 0.0

    cagr = (final_value / initial_value) ** (1.0 / num_years) - 1.0

    return float(cagr)
