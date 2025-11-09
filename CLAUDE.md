# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartRisk Lite is a portfolio risk analysis tool that calculates risk metrics for stock portfolios. It consists of:
- **Backend**: FastAPI-based Python server that fetches stock data and performs portfolio analysis
- **Frontend**: React + Vite application with TailwindCSS for the UI

## Development Commands

### Backend (Python/FastAPI)

Navigate to `Files/backend/` for all backend operations:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
# Runs on http://localhost:8000
```

### Frontend (React/Vite)

Navigate to `Files/frontend/` for all frontend operations:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Vite will auto-select an available port (usually 5173 by default)
# Check the terminal output for the actual URL: "Local: http://localhost:XXXX/"

# Build for production
npm run build

# Lint the code
npm run lint
```

### Running the Full Application

For Windows users, use the convenience scripts in the `Files/` directory:
- `START_SmartRisk.bat` - Starts both backend and frontend servers in separate windows
- `STOP_SmartRisk.bat` - Stops all running servers using port-based process detection
  - Kills processes on port 8000 (backend)
  - Kills processes on ports 517x (Vite frontend)
  - Includes fallback methods for reliability

**Note**: The frontend port is flexible and auto-selected by Vite. Check the "SmartRisk Frontend" terminal window for the actual URL after starting.

## Architecture

### Backend Architecture

**Main Entry Point**: `Files/backend/main.py`
- FastAPI application with single endpoint: `/analyze_portfolio`
- Accepts portfolio tickers and weights via POST request
- Returns calculated risk metrics and portfolio analysis

**Data Adapter Pattern**: `Files/backend/core/data_adapter.py`
- `DataProvider` class abstracts data source selection
- Supports multiple data sources: yfinance (default) and Alpha Vantage
- Configured via environment variables or HTTP headers

**Data Sources**: `Files/backend/sources/`
- `yfinance_source.py` - Free stock data using yfinance library
  - **IMPORTANT**: Uses `auto_adjust=False` parameter to access 'Adj Close' column (yfinance changed default behavior)
- `alpha_vantage_source.py` - Alternative source requiring API key
- Backend automatically falls back between sources if one fails

**Key Calculations**:
- Daily returns from 1-year historical price data (252 trading days)
- Annual expected return (mean daily return × 252)
- Annual volatility (std dev of daily returns × √252)
- Sharpe ratio: (expected return - risk-free rate) / volatility
- Portfolio metrics use covariance matrix for multi-asset calculations

### Frontend Architecture

**Main App**: `Files/frontend/src/App.jsx`
- Manages state for portfolio data, loading, and errors
- Proxies API calls to backend via `/api` prefix (configured in vite.config.js)

**Components**: `Files/frontend/src/components/`
- `InputForm.jsx` - Portfolio ticker and weight input
- `ChartArea.jsx` - Portfolio allocation pie chart (Chart.js)
- `MetricsTable.jsx` - Risk metrics display table
- `SummaryBox.jsx` - Natural language portfolio summary

**Styling**: TailwindCSS with gradient backgrounds and shadow effects

**API Communication**:
- Axios for HTTP requests
- Headers can specify data source: `X-Data-Source` and `X-AlphaVantage-Key`
- 60-second timeout for large portfolio processing

## Environment Variables

Backend supports optional configuration via `.env` file in `Files/backend/`:

```
DATA_SOURCE=yfinance          # Options: yfinance, alpha_vantage
ALPHAVANTAGE_API_KEY=your_key # Required only if using alpha_vantage
```

If not set, defaults to yfinance (no API key required).

## Important Constants

Located in `Files/backend/main.py`:
- `RISK_FREE_RATE = 0.04` - 4% annual risk-free rate for Sharpe ratio
- `DAYS_IN_YEAR = 252` - Trading days for annualization
- `LOOKBACK_DAYS = 365` - Historical data lookback period
- `SHARPE_THRESHOLD_LOW = 0.5` - Threshold for risk categorization
- `SHARPE_THRESHOLD_HIGH = 1.0` - Threshold for efficient portfolios

## Development Notes

### Backend Development
- The backend uses FastAPI with auto-generated docs at http://localhost:8000/docs
- CORS is configured to allow requests from any localhost port for portability
- Portfolio weights must sum to 1.0 (±0.01 tolerance)
- All calculations use 1-year historical data (365 calendar days)

### Frontend Development
- Vite dev server auto-selects an available port (default 5173, but flexible)
- Vite proxies `/api/*` requests to backend at http://localhost:8000
  - **IMPORTANT**: Proxy uses `rewrite` rule to strip `/api` prefix before forwarding to backend
  - Frontend calls `/api/analyze_portfolio` → Backend receives `/analyze_portfolio`
- Frontend shows loading states during data fetching and analysis
- Error handling includes specific messages for timeouts, connection issues, and server errors
- Chart colors are generated dynamically based on number of tickers

### Data Flow
1. User enters tickers and weights in InputForm
2. Frontend sends POST to `/api/analyze_portfolio` (proxied to backend)
3. Backend fetches historical prices from data source (with fallback)
4. Backend calculates daily returns and risk metrics
5. Backend returns individual ticker metrics + portfolio-level metrics
6. Frontend displays results in charts, tables, and summary

### Testing Considerations
- Example portfolio: ["AAPL", "GOOGL", "MSFT"] with equal weights [0.33, 0.33, 0.34]
- Invalid tickers will cause backend to return error response
- Network timeouts are set to 60 seconds for large portfolios
- Frontend includes example portfolio load button for demos

## Known Issues and Fixes

### yfinance Data Fetching
**Issue**: yfinance library changed its default `auto_adjust` parameter to `True`, which removes the 'Adj Close' column.

**Fix Applied**: `Files/backend/sources/yfinance_source.py:22`
```python
data = yf.download(tickers, start=start, end=end, progress=False, auto_adjust=False)['Adj Close']
```
The `auto_adjust=False` parameter ensures the 'Adj Close' column is available.

### Frontend 404 Errors
**Issue**: Vite proxy was not stripping the `/api` prefix, causing 404 errors when the frontend called `/api/analyze_portfolio`.

**Fix Applied**: `Files/frontend/vite.config.js:13`
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```
The `rewrite` rule strips `/api` prefix before forwarding to the backend.

### Server Shutdown
**Issue**: Original STOP_SmartRisk.bat relied on window titles which were unreliable.

**Fix Applied**: `Files/STOP_SmartRisk.bat`
- Now uses `netstat` to find processes listening on specific ports (8000 for backend, 517x for frontend)
- More reliable process termination with multiple fallback methods

## Troubleshooting

### Backend Not Fetching Data
1. Check that yfinance is installed: `pip install yfinance`
2. Verify the `auto_adjust=False` parameter is set in `yfinance_source.py`
3. Test yfinance directly in Python console to check for API issues

### Frontend Can't Connect to Backend
1. Verify backend is running on port 8000: `netstat -ano | findstr ":8000"`
2. Check Vite proxy configuration has the `rewrite` rule
3. Restart frontend after any vite.config.js changes

### Servers Won't Stop
1. Use the updated `STOP_SmartRisk.bat` which uses port-based detection
2. Manually check ports: `netstat -ano | findstr ":8000"` and `netstat -ano | findstr ":517"`
3. Use Task Manager to force-kill python.exe or node.exe processes if needed
