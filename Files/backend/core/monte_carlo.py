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
    num_paths = max(1, num_paths)

    # Constants
    DAYS_IN_YEAR = 252
    total_days = DAYS_IN_YEAR * num_years

    # Calculate historical statistics
    mean_returns = daily_returns.mean().values  # Mean daily return for each asset
    cov_matrix = daily_returns.cov().values     # Covariance matrix of daily returns

    # Convert weights to numpy array if needed
    weights_array = np.array(weights)
    asset_count = len(weights_array)

    rng = np.random.default_rng()

    # Precompute structures for correlated sampling to avoid repeated decompositions
    chol = None
    if asset_count > 1:
        try:
            chol = np.linalg.cholesky(cov_matrix)
        except np.linalg.LinAlgError:
            # Add small jitter for numerical stability
            jitter = np.eye(asset_count) * 1e-8
            chol = np.linalg.cholesky(cov_matrix + jitter)
    else:
        # Single asset stats
        mean_return_single = mean_returns[0]
        std_return_single = np.sqrt(max(cov_matrix[0, 0], 0))

    years = list(range(1, num_years + 1))
    capture_lookup = {year * DAYS_IN_YEAR: year for year in years}
    yearly_values = {year: [] for year in years}

    chunk_size = int(os.getenv('MC_PATH_CHUNK_SIZE', 500))
    chunk_size = max(1, min(chunk_size, num_paths))

    for chunk_start in range(0, num_paths, chunk_size):
        paths_in_chunk = min(chunk_size, num_paths - chunk_start)
        current_values = np.full(paths_in_chunk, initial_value, dtype=np.float64)

        for day in range(1, total_days + 1):
            if asset_count == 1:
                daily_returns = rng.normal(
                    loc=mean_return_single,
                    scale=std_return_single,
                    size=paths_in_chunk
                )
            else:
                standard_normals = rng.standard_normal(size=(paths_in_chunk, asset_count))
                correlated = standard_normals @ chol.T
                correlated += mean_returns
                daily_returns = correlated @ weights_array

            current_values *= (1 + daily_returns)

            if day in capture_lookup:
                year = capture_lookup[day]
                yearly_values[year].append(current_values.copy())

    percentiles = {
        'p10': [],
        'p50': [],
        'p90': [],
        'mean': []
    }

    for year in years:
        if yearly_values[year]:
            year_samples = np.concatenate(yearly_values[year])
        else:
            year_samples = np.array([initial_value], dtype=np.float64)

        percentiles['p10'].append(float(np.percentile(year_samples, 10)))
        percentiles['p50'].append(float(np.percentile(year_samples, 50)))
        percentiles['p90'].append(float(np.percentile(year_samples, 90)))
        percentiles['mean'].append(float(np.mean(year_samples)))

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
