# SmartRisk Agent-Agnostic Plan

This doc keeps every agent aligned on the product vision, current focus, and prioritized backlog. Update it whenever scope or ordering changes—no calendar dates required.

---

## Product Vision
- Deliver an interactive portfolio cockpit that feels tactile (drag to rebalance), yet explains risk in clear language anyone can trust.
- Combine deterministic stats (expected return, volatility, Sharpe) with Monte Carlo projections that respect real volatility and asset correlations.
- Keep inputs approachable: comprehensive asset lists (stocks, ETFs, crypto), drag-friendly allocation editing, and intelligent data caching.

---

## Work Streams & Status

### Experience (UX & React)
- **Done**: `StockSelector` with search, asset class filter, sector filter, and drag handles backed by expanded `/popular_stocks` (236 assets: 170 stocks, 56 ETFs, 10 crypto).
- **Done**: `PortfolioBuilder` with drag-and-drop, dynamic pie chart, individual weight editing, and auto-normalization.
- **Done**: `ProjectionSlider` (1–10 years) with red warning beyond 5 years and always-visible disclaimer.
- **Done**: `AdvancedProjections` collapsible Monte Carlo percentile chart (P10/P50/P90 visualization).
- **Done**: `DataSourceInfo` component showing cache status and original data provider with color-coded badges.
- **Done**: Enhanced `SummaryBox` renamed to "Portfolio Analysis" with detailed risk interpretation, diversification metrics, and concentration warnings.
- **Done**: Global dark-mode toggle with persisted preference plus Tailwind dark styles across every major card/table.
- **Planned**: Add initial investment and periodic contribution inputs for cash-flow-aware projections.

### Analytics (Backend logic)
- **Done**: Monte Carlo percentile engine (P10/P50/P90) for 1-10 year projections with 5,000 simulated paths.
- **Done**: Historical CAGR calculation from actual price data.
- **Done**: Intelligent caching system (`core/cache_manager.py`) with 24-hour TTL and original source tracking.
- **Done**: Hybrid data fetching strategy (Alpha Vantage + yfinance fallback) with rate limit handling (25 calls/day, 5 calls/min).
- **Done**: Graceful partial failure handling - adjusts weights proportionally when tickers fail, continues analysis with available assets.
- **Done**: Enhanced `generate_summary()` with 5-level Sharpe interpretation, return classification, volatility assessment, diversification analysis.
- **Done**: Expanded asset database to 236 entries with `assetClass` field for filtering.
- **Done**: Frontend warning system for Alpha Vantage limitations (25 calls/day, 5 calls/min, automatic fallback).
- **Next Up**:
  1. Extend `Portfolio` model + validation for `initial_investment`, `monthly_contribution`, `contribution_frequency`.
  2. Update Monte Carlo simulations to include contributions and emit dollar projections alongside percentages.
  3. Add `core/asset_detector.py` to automatically tag asset types (stock/ETF/crypto/bond) from yfinance metadata.

### Platform (Quality, tooling, docs)
- **Done**: Document cache strategy, data source fallback, and partial failure handling in codebase.
- **Queued**: Regression script/notebook to sanity-check percentile bands before deploy; base it on recorded seed portfolios.
- **Queued**: Save/load portfolio state (localStorage) and CSV import tooling.
- **Queued**: PDF export functionality for portfolio analysis reports.

---

## Backlog (Prioritized)
1. Contribution-aware Monte Carlo output (dollar projections with periodic contributions, 1–10 years).
2. Extended FastAPI schema & validation messaging for cash-flow fields.
3. Asset-type auto-detection and sector/factor analytics visualization.
4. Portfolio persistence (CSV import, localStorage save/load).
5. PDF export for professional portfolio reports.
6. Advanced risk metrics (max drawdown, Sortino ratio, tail risk analysis).

Items 1–2 unblock contribution-based projections; downstream tasks (3–6) enhance the analytical depth.

---

## Recent Improvements (Session Summary)

### Data Source Enhancements
- Cache now tracks original data provider (Yahoo Finance vs Alpha Vantage)
- UI displays "Yahoo Finance (Cached)" instead of generic "Cached Data (24h)"
- Improved transparency for users about data provenance

### Portfolio Analysis
- Complete rewrite of summary generation:
  - 5-level Sharpe ratio interpretation (underperforming → exceptional)
  - Return classification (conservative → aggressive)
  - Volatility assessment (low → high)
  - Concentration warnings for >50% single-asset portfolios
  - Diversification quality analysis
  - Actionable recommendations
- Removed duplicate pie chart from results (PortfolioBuilder already has one)

### Error Handling
- Graceful partial failures: if one ticker fails, analysis proceeds with remaining assets
- Weights automatically adjusted proportionally
- Clear warnings shown to user about missing tickers
- Better error messages mentioning Alpha Vantage rate limits when applicable

### Asset Coverage
- Expanded from 66 → 236 available assets (3.5x increase)
- Added `assetClass` field: Stock, ETF, Crypto
- Dual filtering: Asset Class + Sector dropdowns
- Results counter: "Showing X of 236 assets"
- Color-coded badges (Blue=Stock, Green=ETF, Purple=Crypto)

### Theming & Polish
- Added persistent dark-mode toggle plus refreshed Tailwind `dark:` styles for selectors, builders, projections, summaries, and tables.

---

## Notes & Assumptions
- Monte Carlo path count remains configurable via code constant (currently 5,000 paths).
- Risk-free rate currently hardcoded at 4%; revisit automation after core experience is stable.
- Cache TTL set to 24 hours to balance freshness with API rate limits.
- Alpha Vantage free tier: 25 calls/day, 5 calls/min - system automatically falls back to yfinance.
- Partial portfolio analysis allows users to get results even when some tickers fail.
- Always log manual smoke test steps in PR descriptions when deploying changes that affect projections or inputs.
