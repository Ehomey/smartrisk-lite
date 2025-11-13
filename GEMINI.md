# SmartRisk Agent-Agnostic Plan

This doc keeps every agent aligned on the product vision, current focus, and prioritized backlog. Update it whenever scope or ordering changesâ€”no calendar dates required.

---

## Product Vision
- Deliver an interactive portfolio cockpit that feels tactile (drag to rebalance), yet explains risk in clear language anyone can trust.
- Combine deterministic stats (expected return, volatility, Sharpe) with Monte Carlo projections that respect real volatility, contributions, and asset mixes.
- Keep inputs approachable: curated asset lists, dragâ€‘friendly allocation editing, and sensible defaults for equities, ETFs, and crypto.

---

## Work Streams & Status

### Experience (UX & React)
- **In Progress**: Refactor `InputForm` to capture initial investment, periodic contributions, and synchronized weight editing.
- **In Progress**: Build `StockSelector` (search + filter + drag handles) backed by `/popular_stocks`.
- **Planned**: Create `InteractivePieChart` with custom pointer handlers (Chart.js aloneâ€”`chartjs-plugin-dragdata` is incompatible with the pie resizing UX we want).
- **Planned**: Add `ProjectionView` slider (1â€“10 years) whose result text turns red beyond 5 years and always shows a â€œlonger-term uncertaintyâ€ disclaimer.

### Analytics (Backend logic)
- **Done**: Monte Carlo percentile engine returning multi-year stats; `/popular_stocks` endpoint seeded.
- **Next Up**:
  1. Extend `Portfolio` model + validation for `initial_investment`, `monthly_contribution`, `contribution_frequency`.
  2. Update Monte Carlo simulations to include contributions, detect asset types, and emit both dollar and percentage projections (P10/P50/P90 + mean for 1â€“10 years).
  3. Add `core/asset_detector.py` to tag stocks/ETF/crypto/bonds (leveraging yfinance metadata).
  4. Relax ticker validation to allow characters used by crypto, forex, and futures.

### Platform (Quality, tooling, docs)
- **In Progress**: Document Monte Carlo assumptions and new inputs across `README`, `CLAUDE.md`, and this file once features land.
- **Queued**: Regression script/notebook to sanity-check percentile bands before deploy; base it on recorded seed portfolios.
- **Queued**: Save/load portfolio state (localStorage) and CSV import tooling once the new input model stabilizes.

---

## Backlog (Prioritized)
1. Contribution-aware Monte Carlo output (percentages + dollar projections, 1â€“10 years).
2. Expanded FastAPI schema & validation messaging for new cash-flow fields and ticker characters.
3. Interactive allocation UI (`StockSelector`, `InteractivePieChart`, synchronized list).
4. Projection slider + disclaimer + percentile visualization fed by backend payload.
5. Asset-type detection, sector/factor analytics, and matching React visualizations.
6. Portfolio persistence (CSV import, localStorage save/load) and PDF reporting polish.

Items 1â€“4 unblock the interactive projection experience; downstream tasks (5â€“6) depend on the richer data model.

---

## Notes & Assumptions
- Drag interactions will be implemented with native pointer events + Chart.js datasets; no reliance on `chartjs-plugin-dragdata`.
- Monte Carlo path count should remain configurable via env var for tuning performance vs. precision.
- Keep risk-free rate configurable; revisit automation after the core experience is stable.
- Always log manual smoke test steps in PR descriptions when deploying changes that affect projections or inputs.


