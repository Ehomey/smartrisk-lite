# SmartRisk Lite Backend

This backend provides an API for analyzing stock portfolios.

## Environment Variables

To configure the data source, set the following environment variables:

- `DATA_SOURCE`: The data source to use. Supported values are `alpha_vantage` and `yfinance`. If not set, the default is `yfinance`.
- `ALPHAVANTAGE_API_KEY`: Your API key for Alpha Vantage. This is required if `DATA_SOURCE` is set to `alpha_vantage`.

Example:
```
export DATA_SOURCE=alpha_vantage
export ALPHAVANTAGE_API_KEY=your_key_here
```
