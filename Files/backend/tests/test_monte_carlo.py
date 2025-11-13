import numpy as np
import pandas as pd

from core.monte_carlo import run_monte_carlo_simulation


def _expected_value(daily_return, years, initial):
    trading_days = 252
    return initial * (1 + daily_return) ** (trading_days * years)


def test_single_asset_deterministic_paths():
    daily_return = 0.001
    returns = pd.DataFrame([[daily_return] * 252] * 1, columns=[f"day_{i}" for i in range(252)]).T
    returns.columns = ["AAA"]
    weights = [1.0]

    result = run_monte_carlo_simulation(
        returns,
        weights,
        num_years=2,
        num_paths=250,
        initial_value=5000,
        rng=np.random.default_rng(123)
    )

    for year_idx, expected_year in enumerate(result['years'], start=1):
        expected_value = _expected_value(daily_return, expected_year, 5000)
        for key in ['p10', 'p50', 'p90', 'mean']:
            assert np.isclose(result['percentiles'][key][year_idx - 1], expected_value, rtol=1e-12)


def test_multi_asset_deterministic_weights_and_chunk(monkeypatch):
    daily_returns = pd.DataFrame({
        "AAA": [0.001] * 252,
        "BBB": [0.0005] * 252,
        "CCC": [0.0002] * 252,
    })
    weights = [0.5, 0.3, 0.2]

    monkeypatch.setenv('MC_PATH_CHUNK_SIZE', '17')
    small_chunk = run_monte_carlo_simulation(
        daily_returns,
        weights,
        num_years=3,
        num_paths=300,
        initial_value=10000,
        rng=np.random.default_rng(987)
    )

    monkeypatch.setenv('MC_PATH_CHUNK_SIZE', '500')
    large_chunk = run_monte_carlo_simulation(
        daily_returns,
        weights,
        num_years=3,
        num_paths=300,
        initial_value=10000,
        rng=np.random.default_rng(987)
    )

    for key in ['p10', 'p50', 'p90', 'mean']:
        np.testing.assert_allclose(
            small_chunk['percentiles'][key],
            large_chunk['percentiles'][key],
            rtol=0.001,
            atol=1e-6
        )


def test_random_chunk_consistency(monkeypatch):
    rng_data = np.random.default_rng(42)
    returns = pd.DataFrame(rng_data.normal(0.0005, 0.01, size=(252, 3)), columns=["AAA", "BBB", "CCC"])
    weights = [0.5, 0.3, 0.2]

    rng_seed = 777
    monkeypatch.setenv('MC_PATH_CHUNK_SIZE', '37')
    result_small = run_monte_carlo_simulation(
        returns,
        weights,
        num_years=3,
        num_paths=500,
        initial_value=10000,
        rng=np.random.default_rng(rng_seed)
    )

    monkeypatch.setenv('MC_PATH_CHUNK_SIZE', '500')
    result_large = run_monte_carlo_simulation(
        returns,
        weights,
        num_years=3,
        num_paths=500,
        initial_value=10000,
        rng=np.random.default_rng(rng_seed)
    )

    for key in ['p10', 'p50', 'p90', 'mean']:
        np.testing.assert_allclose(
            result_small['percentiles'][key],
            result_large['percentiles'][key],
            rtol=0.02,
            atol=1e-6
        )


def test_single_asset_percentage_output(monkeypatch):
    rng_data = np.random.default_rng(7)
    returns = pd.DataFrame(rng_data.normal(0.0003, 0.008, size=(252, 1)), columns=["AAA"])
    weights = [1.0]
    monkeypatch.setenv('MC_PATH_CHUNK_SIZE', '500')

    result = run_monte_carlo_simulation(returns, weights, num_years=2, num_paths=200, initial_value=5000, rng=np.random.default_rng(55))

    assert result['years'] == [1, 2]
    for key in ['p10', 'p50', 'p90', 'mean']:
        assert len(result['percentiles'][key]) == 2
        assert all(value > 0 for value in result['percentiles'][key])


def test_chunk_size_larger_than_paths(monkeypatch):
    rng_data = np.random.default_rng(9)
    returns = pd.DataFrame(rng_data.normal(0.0004, 0.009, size=(252, 2)), columns=["AAA", "BBB"])
    weights = [0.6, 0.4]
    monkeypatch.setenv('MC_PATH_CHUNK_SIZE', '1000')

    result = run_monte_carlo_simulation(returns, weights, num_years=1, num_paths=120, initial_value=8000, rng=np.random.default_rng(88))

    assert result['years'] == [1]
    for key in ['p10', 'p50', 'p90', 'mean']:
        assert len(result['percentiles'][key]) == 1
        assert result['percentiles'][key][0] > 0
