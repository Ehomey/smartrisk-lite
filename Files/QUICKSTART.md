# Quick Start Guide - SmartRisk Lite

## Get Running in 5 Minutes

### Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend folder
cd "C:\Users\ehome\Desktop\Gordon portfolio risk project\Files\backend"

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend
python main.py
```

✅ You should see: `Uvicorn running on http://0.0.0.0:8000`

---

### Step 2: Frontend Setup (2 minutes)

Open a **NEW** terminal window:

```bash
# Navigate to frontend folder
cd "C:\Users\ehome\Desktop\Gordon portfolio risk project\Files\frontend"

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

✅ You should see: `Local: http://localhost:3000`

---

### Step 3: Use the App (1 minute)

1. Open your browser to: **http://localhost:3000**

2. Try the example portfolio:
   - Click "Load Example Portfolio"
   - Click "Analyze Portfolio"

3. See your results:
   - Portfolio allocation chart
   - Risk metrics table
   - Investment projections

---

## Troubleshooting

### "Port already in use" error?
**Backend (Port 8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Can't connect to backend?
- Make sure backend is running (`python main.py`)
- Check backend is on http://localhost:8000
- Try restarting both backend and frontend

### Data fetch fails?
- Check your internet connection
- Verify ticker symbols are correct (e.g., AAPL not Apple)
- For Alpha Vantage, get a free API key at: https://www.alphavantage.co/support/#api-key

---

## Example Portfolios to Try

### Conservative Portfolio
```
Tickers: JNJ,PG,KO,PEP
Weights: 0.25,0.25,0.25,0.25
```

### Aggressive Tech Portfolio
```
Tickers: NVDA,TSLA,META,GOOGL
Weights: 0.3,0.3,0.2,0.2
```

### Balanced Portfolio
```
Tickers: SPY,BND,GLD,VNQ
Weights: 0.4,0.3,0.2,0.1
```

---

## Understanding Your Results

### Sharpe Ratio
- **< 0.5**: Higher risk for the reward 🔴
- **0.5 - 1.0**: Moderate risk-adjusted 🟡
- **> 1.0**: Efficient risk-adjusted ✅

### Expected Return
Annual return you can expect based on historical data

### Volatility
How much the portfolio value fluctuates (higher = riskier)

### Investment Horizons
Projected cumulative returns over:
- 1 year
- 3 years
- 5 years

---

## Stopping the App

**Backend:**
- Press `Ctrl+C` in the backend terminal

**Frontend:**
- Press `Ctrl+C` in the frontend terminal

---

## Next Steps

1. ✅ Try analyzing different portfolios
2. ✅ Experiment with different weight distributions
3. ✅ Compare tech stocks vs defensive stocks
4. ✅ Read the full README.md for advanced features

---

## Need Help?

Check these files:
- `README.md` - Full documentation
- `FIXES_SUMMARY.md` - Recent improvements
- `backend/README.md` - Backend API details

---

**Enjoy analyzing your portfolios! 📈**
