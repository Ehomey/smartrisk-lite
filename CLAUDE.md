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
- **Done**: Global dark-mode toggle with persisted preference + Tailwind dark styles across major UI panels.
- **Done**: Simulation settings UI exposing 5k/10k/20k Monte Carlo path counts with accessible radio buttons.
- **Done**: PortfolioBuilder weight inputs display percentages with a running total so users always reconcile to 100%.
- **Done**: StockSelector has labeled filters, server-side pagination, a quick "+ Add" action, and a live yfinance lookup for off-list tickers.
- **Done**: Expandable "About These Insights" panel now explains every metric in plain language for newer investors.
- **Done**: Investment Settings panel with initial investment, periodic contribution amount, and contribution frequency inputs (monthly/quarterly/annually).
- **Done**: Dollar-based projection displays showing absolute portfolio values alongside percentage returns, with automatic contribution tracking.

### Analytics (Backend logic)
- **Done**: Monte Carlo percentile engine (P10/P50/P90) for 1-10 year projections with configurable path counts (5k/10k/20k).
- **Done**: Historical CAGR calculation from actual price data.
- **Done**: Intelligent caching system (`core/cache_manager.py`) with 24-hour TTL and original source tracking.
- **Done**: Hybrid data fetching strategy (Alpha Vantage + yfinance fallback) with rate limit handling (25 calls/day, 5 calls/min).
- **Done**: Graceful partial failure handling - adjusts weights proportionally when tickers fail, continues analysis with available assets.
- **Done**: Enhanced `generate_summary()` with 5-level Sharpe interpretation, return classification, volatility assessment, diversification analysis.
- **Done**: Expanded asset database to 236 entries with `assetClass` field for filtering.
- **Done**: Frontend warning system for Alpha Vantage limitations (25 calls/day, 5 calls/min, automatic fallback).
- **Done**: Monte Carlo engine refactored to stream simulations in memory-safe chunks while honoring user-selected path counts up to 20k.
- **Done**: `/popular_stocks` now supports pagination + facets, and `/search_assets` taps yfinance for live ticker lookups when users need more than the curated list.
- **Done**: Extended `Portfolio` model with `initial_investment`, `monthly_contribution`, `contribution_frequency` fields and comprehensive validation.
- **Done**: Contribution-aware Monte Carlo simulations that inject periodic contributions (monthly/quarterly/annually) throughout projection period.
- **Done**: Dollar-based projection output - percentile values now reflect actual portfolio value including contributions, returned in `contribution_settings` response.
- **Next Up**:
  1. Add `core/asset_detector.py` to automatically tag asset types (stock/ETF/crypto/bond) from yfinance metadata.
  2. Enhanced contribution logic with contribution timing options (beginning vs end of period).

### Platform (Quality, tooling, docs)
- **Done**: Document cache strategy, data source fallback, and partial failure handling in codebase.
- **Queued**: Regression script/notebook to sanity-check percentile bands before deploy; base it on recorded seed portfolios.
- **Queued**: Save/load portfolio state (localStorage) and CSV import tooling.
- **Queued**: PDF export functionality for portfolio analysis reports.

---

## Backlog (Prioritized)
1. Asset-type auto-detection and sector/factor analytics visualization.
2. Portfolio persistence (CSV import, localStorage save/load).
3. PDF export for professional portfolio reports.
4. Advanced risk metrics (max drawdown, Sortino ratio, tail risk analysis).
5. Enhanced contribution timing options (beginning vs end of period).
6. Tax-aware projections considering capital gains and dividend taxation.

Contribution-based projections are now live; items 1–4 enhance analytical depth and usability.

---

## Recent Improvements (Session Summary)

### Contribution-Aware Projections (Current Session)
- **Backend**: Extended `Portfolio` model to accept `initial_investment`, `monthly_contribution`, and `contribution_frequency`
- **Validation**: Added comprehensive input validation for cash-flow parameters (positive initial investment, non-negative contributions, valid frequency)
- **Monte Carlo Engine**: Refactored to inject periodic contributions during simulation:
  - Contributions added at appropriate intervals (monthly=21 days, quarterly=63 days, annually=252 days)
  - Projections now return actual dollar values reflecting both growth and contributions
- **API Response**: Added `contribution_settings` object to `/analyze_portfolio` response for frontend display
- **Frontend UI**: New Investment Settings panel with three inputs:
  - Initial Investment (defaults to $10,000)
  - Contribution Amount (defaults to $0)
  - Contribution Frequency (monthly/quarterly/annually)
- **Display Enhancements**:
  - `ProjectionSlider` now shows dollar values prominently with percentage returns as secondary
  - Displays total invested (initial + contributions) when contributions are active
  - `AdvancedProjections` tooltips calculate returns based on total invested including contributions
  - Both components automatically adjust return calculations based on contribution schedule

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
- Added dark-mode toggle with persisted preference plus refreshed Tailwind `dark:` styles across selectors, builders, projections, tables, and summary cards.

---

## Notes & Assumptions
- Monte Carlo path count remains configurable via code constant (currently 5,000 paths).
- Risk-free rate currently hardcoded at 4%; revisit automation after core experience is stable.
- Cache TTL set to 24 hours to balance freshness with API rate limits.
- Alpha Vantage free tier: 25 calls/day, 5 calls/min - system automatically falls back to yfinance.
- Partial portfolio analysis allows users to get results even when some tickers fail.
- Always log manual smoke test steps in PR descriptions when deploying changes that affect projections or inputs.
