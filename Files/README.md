# SmartRisk Lite - Portfolio Risk Analysis Tool

A full-stack web application for analyzing stock portfolio risk and returns using modern portfolio theory.

## Features

✅ **Portfolio Analysis**: Calculate expected returns, volatility, and Sharpe ratios  
✅ **Dual Data Sources**: Support for Yahoo Finance (free) and Alpha Vantage (API key required)  
✅ **Interactive Charts**: Visual portfolio allocation with Chart.js  
✅ **Investment Horizons**: Project returns over 1, 3, and 5-year periods  
✅ **Input Validation**: Both frontend and backend validation for data integrity  
✅ **Smart Fallback**: Automatic fallback to alternative data source if primary fails  
✅ **Modern UI**: Responsive design with Tailwind CSS  

## Recent Improvements (Code Review Fixes)

### Backend Fixes
- ✅ Added missing imports (`pandas`, `datetime`, `os`)
- ✅ Fixed relative imports for better module resolution
- ✅ Added comprehensive input validation function
- ✅ Improved Sharpe ratio calculation with risk-free rate (4%)
- ✅ Fixed investment horizon calculations (proper CAGR)
- ✅ Enhanced error handling for data sources
- ✅ Bidirectional fallback (yfinance ↔ Alpha Vantage)
- ✅ Better rate limiting and progress messages for Alpha Vantage
- ✅ Added weights and tickers to API response

### Frontend Fixes
- ✅ Fixed chart to display actual portfolio weights (not Sharpe ratios)
- ✅ Added comprehensive frontend input validation
- ✅ Real-time weight sum calculator
- ✅ Better error messages and loading states
- ✅ Timeout handling for long requests
- ✅ Empty state when no analysis exists
- ✅ Improved UI with better visual feedback
- ✅ Added footer with disclaimer

### Dependencies
- ✅ Removed unused dependencies (`alpha_vantage`, `Pillow`, `python-multipart`)
- ✅ Added `pandas>=1.5.0` to requirements

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. (Optional) Create a `.env` file for default data source:
```env
DATA_SOURCE=yfinance
ALPHAVANTAGE_API_KEY=your_key_here
```

5. Run the backend:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. **Enter Tickers**: Input stock symbols (e.g., `AAPL,MSFT,GOOG`)
2. **Enter Weights**: Portfolio weights that sum to 1.0 (e.g., `0.4,0.3,0.3`)
3. **Select Data Source**:
   - **Yahoo Finance**: Free, no API key required (default)
   - **Alpha Vantage**: Requires free API key from [alphavantage.co](https://www.alphavantage.co/support/#api-key)
4. **Analyze**: Click "Analyze Portfolio" to see results

## API Endpoints

### POST `/analyze_portfolio`

Analyzes a portfolio and returns risk metrics.

**Request Body:**
```json
{
  "tickers": ["AAPL", "MSFT", "GOOG"],
  "weights": [0.4, 0.3, 0.3]
}
```

**Headers (Optional):**
- `X-Data-Source`: "yfinance" or "alpha_vantage"
- `X-AlphaVantage-Key`: Your Alpha Vantage API key (if using Alpha Vantage)

**Response:**
```json
{
  "individual_metrics": {
    "AAPL": {
      "expected_annual_return": 0.15,
      "annual_volatility": 0.25,
      "sharpe_ratio": 0.44
    }
  },
  "portfolio_metrics": {
    "expected_annual_return": 0.12,
    "annual_volatility": 0.20,
    "sharpe_ratio": 0.40,
    "horizons": {
      "1y": 0.12,
      "3y": 0.40,
      "5y": 0.76
    }
  },
  "weights": [0.4, 0.3, 0.3],
  "tickers": ["AAPL", "MSFT", "GOOG"],
  "summary": "The portfolio has a moderate risk-adjusted profile."
}
```

## Configuration

### Constants (backend/main.py)
```python
RISK_FREE_RATE = 0.04        # 4% annual risk-free rate
SHARPE_THRESHOLD_LOW = 0.5   # Threshold for "higher risk"
SHARPE_THRESHOLD_HIGH = 1.0  # Threshold for "efficient"
DAYS_IN_YEAR = 252           # Trading days per year
LOOKBACK_DAYS = 365          # Historical data period
```

## Data Sources

### Yahoo Finance (yfinance)
- **Pros**: Free, no API key needed, reliable
- **Cons**: May have rate limits for excessive requests
- **Best for**: General use, quick analysis

### Alpha Vantage
- **Pros**: More reliable for institutional use, comprehensive data
- **Cons**: Requires API key, free tier limited to 5 requests/minute
- **Best for**: Production use, when yfinance is unavailable

## Input Validation

The application validates:
- ✅ Tickers are valid format (1-5 uppercase letters)
- ✅ Number of tickers matches number of weights
- ✅ Weights are non-negative and ≤ 1.0
- ✅ Weights sum to 1.0 (±0.01 tolerance)
- ✅ At least one ticker is provided
- ✅ Alpha Vantage API key when using that source

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (requires 3.8+)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check if port 8000 is available

### Frontend can't connect to backend
- Ensure backend is running on http://localhost:8000
- Check CORS settings in `main.py`
- Verify network isn't blocking local connections

### Data fetch fails
- **Invalid tickers**: Check ticker symbols are correct
- **Alpha Vantage**: Verify API key is valid
- **Rate limits**: Wait a minute if hitting rate limits
- The app will automatically try the fallback source

### "Weights must sum to 1.0" error
- Check for typos in weight values
- Ensure weights add up to exactly 1.0
- Example: `0.33,0.33,0.34` (not `0.33,0.33,0.33`)

## Project Structure

```
Files/
├── backend/
│   ├── core/
│   │   └── data_adapter.py      # Data source abstraction
│   ├── sources/
│   │   ├── yfinance_source.py   # Yahoo Finance integration
│   │   └── alpha_vantage_source.py  # Alpha Vantage integration
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   └── README.md               # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.jsx   # Portfolio input form
│   │   │   ├── ChartArea.jsx   # Portfolio allocation chart
│   │   │   ├── MetricsTable.jsx # Risk metrics table
│   │   │   └── SummaryBox.jsx  # AI-generated summary
│   │   ├── App.jsx             # Main application
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Node dependencies
│   └── tailwind.config.js      # Tailwind configuration
└── README.md                   # This file
```

## Financial Metrics Explained

### Expected Annual Return
Average return you can expect over a year, based on historical data.

### Annual Volatility (Risk)
Standard deviation of returns - higher = more price swings.

### Sharpe Ratio
Risk-adjusted return metric. Formula: `(Return - Risk-Free Rate) / Volatility`
- < 0.5: Higher risk for the reward
- 0.5 - 1.0: Moderate risk-adjusted profile
- > 1.0: Efficient risk-adjusted profile

### Investment Horizons
Projected cumulative returns over 1, 3, and 5 years using compound annual growth rate (CAGR).

## Disclaimer

⚠️ **Important**: This tool is for educational and informational purposes only. It is NOT financial advice. Always consult with a qualified financial advisor before making investment decisions.

## License

This project is for educational purposes. Use at your own risk.

## Contributing

This is a learning project. Suggestions for improvements are welcome!

## Future Enhancements

Potential improvements:
- [ ] Add Monte Carlo simulation
- [ ] Efficient frontier visualization
- [ ] Historical backtesting
- [ ] Export results to PDF/CSV
- [ ] Compare multiple portfolios
- [ ] Add more risk metrics (VaR, CVaR)
- [ ] User accounts for saving portfolios
- [ ] Real-time price updates
- [ ] Mobile app version
