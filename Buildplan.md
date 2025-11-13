Buildplan.md
 Comprehensive Portfolio Builder Enhancement Plan                                                                │
     │                                                                                                                 │
     │ Overview                                                                                                        │
     │                                                                                                                 │
     │ Transform SmartRisk Lite into a professional portfolio analytics platform with multi-asset support, interactive │
     │ weight management, sector/factor analysis, and PDF reports.                                                     │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ PHASE 1: FOUNDATION (Week 1-2) - MVP Features                                                                   │
     │                                                                                                                 │
     │ 🎯 My Work (Lead Programmer)                                                                                    │
     │                                                                                                                 │
     │ 1. Backend: Multi-Asset Support                                                                                 │
     │ - Update Portfolio model: add initial_investment, monthly_contribution, contribution_frequency                  │
     │ - Create core/asset_detector.py: detect asset types (stock/ETF/crypto/bond) via yfinance                        │
     │ - Update core/monte_carlo.py: incorporate periodic contributions into simulations                               │
     │ - Modify main.py: return dollar values alongside percentages in projections                                     │
     │ - Update ticker validation: allow -, =, ^ characters (crypto/forex/futures)                                     │
     │                                                                                                                 │
     │ 2. Frontend: Interactive Weight Management                                                                      │
     │ - Create InteractivePieChart.jsx: bidirectional chart ↔ input sync                                              │
     │   - Implement chartjs-plugin-dragdata for draggable segments                                                    │
     │   - Auto-calculate equal weights on ticker add/remove                                                           │
     │   - Real-time validation (ensure sum = 100%)                                                                    │
     │ - Major refactor of InputForm.jsx:                                                                              │
     │   - Add initial investment input (default $10,000)                                                              │
     │   - Add contribution amount/frequency inputs                                                                    │
     │   - Replace CSV inputs with interactive stock list                                                              │
     │   - Integrate drag-drop from StockSelector                                                                      │
     │   - Wire up weight textboxes ↔ pie chart sync                                                                   │
     │                                                                                                                 │
     │ 3. State Management & Integration                                                                               │
     │ - Update App.jsx: manage new investment parameters                                                              │
     │ - Wire all new components together                                                                              │
     │ - Pass dollar values to ProjectionSlider and AdvancedProjections                                                │
     │                                                                                                                 │
     │ 🤝 Gemini's Work (Helper)                                                                                       │
     │                                                                                                                 │
     │ 1. Create StockSelector Component                                                                               │
     │ - Build StockSelector.jsx: searchable/filterable stock list                                                     │
     │ - Implement HTML5 drag-and-drop source                                                                          │
     │ - Display ticker, company name, sector                                                                          │
     │ - Support dragging stocks into portfolio                                                                        │
     │                                                                                                                 │
     │ 2. Create Popular Stocks Data                                                                                   │
     │ - Create Files/backend/data/popular_stocks.json                                                                 │
     │ - Populate with ~100 S&P 500 stocks (ticker, name, sector)                                                      │
     │ - Include major ETFs and crypto assets (BTC-USD, ETH-USD)                                                       │
     │                                                                                                                 │
     │ 3. Backend: Popular Stocks Endpoint                                                                             │
     │ - Create GET /popular_stocks endpoint in main.py                                                                │
     │ - Serve stock list JSON                                                                                         │
     │ - Add optional filtering by asset type                                                                          │
     │                                                                                                                 │
     │ 4. Update ProjectionSlider Display                                                                              │
     │ - Modify ProjectionSlider.jsx: show dollar values                                                               │
     │ - Format: "Projected Value: $X,XXX (+Y%)"                                                                       │
     │ - Use initial_investment from props                                                                             │
     │                                                                                                                 │
     │ 5. Frontend Package Updates                                                                                     │
     │ - Install chartjs-plugin-dragdata: npm install chartjs-plugin-dragdata                                          │
     │ - Test compatibility with Chart.js v4                                                                           │
     │ - Update package.json                                                                                           │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ PHASE 2: ANALYTICS (Week 3-4) - Advanced Features                                                               │
     │                                                                                                                 │
     │ 🎯 My Work (Lead Programmer)                                                                                    │
     │                                                                                                                 │
     │ 1. Backend: Sector Analysis                                                                                     │
     │ - Create core/sector_analysis.py: aggregate portfolio sector exposure                                           │
     │ - Fetch sector data via yfinance Ticker.info['sector']                                                          │
     │ - Calculate weighted sector allocation                                                                          │
     │ - Return sector breakdown in API response                                                                       │
     │                                                                                                                 │
     │ 2. Backend: Factor Exposure                                                                                     │
     │ - Create core/factor_analysis.py: characteristic-based factor scoring                                           │
     │ - Calculate 4 core factors:                                                                                     │
     │   - Value: P/B ratio                                                                                            │
     │   - Growth: PEG ratio                                                                                           │
     │   - Momentum: 12-month price performance                                                                        │
     │   - Size: Market cap percentile                                                                                 │
     │ - Normalize scores to -2 to +2 scale                                                                            │
     │ - Return factor exposures in API response                                                                       │
     │                                                                                                                 │
     │ 3. Frontend: Advanced Visualizations                                                                            │
     │ - Create SectorBreakdown.jsx: pie chart of sector allocation                                                    │
     │ - Create FactorExposure.jsx: radar chart showing factor tilts                                                   │
     │ - Integrate into main dashboard layout                                                                          │
     │ - Add tooltips/explanations for each factor                                                                     │
     │                                                                                                                 │
     │ 🤝 Gemini's Work (Helper)                                                                                       │
     │                                                                                                                 │
     │ 1. Enhanced Asset Type Display                                                                                  │
     │ - Add visual badges/icons for asset types (stock/ETF/crypto/bond)                                               │
     │ - Color-code different asset classes                                                                            │
     │ - Update ChartArea to show asset type breakdown                                                                 │
     │                                                                                                                 │
     │ 2. Chart Sizing Improvements                                                                                    │
     │ - Fix ChartArea.jsx: add explicit 400px height container                                                        │
     │ - Set maintainAspectRatio: false for all charts                                                                 │
     │ - Ensure responsive behavior on mobile                                                                          │
     │ - Match sizing across all visualizations                                                                        │
     │                                                                                                                 │
     │ 3. UI Polish & Styling                                                                                          │
     │ - Improve spacing/layout for new components                                                                     │
     │ - Add loading states for sector/factor calculations                                                             │
     │ - Error handling for missing fundamental data                                                                   │
     │ - Mobile responsive adjustments                                                                                 │
     │                                                                                                                 │
     │ 4. Testing & Bug Fixes                                                                                          │
     │ - Test weight auto-calculation edge cases                                                                       │
     │ - Verify drag-and-drop works across browsers                                                                    │
     │ - Test sector/factor displays with various portfolios                                                           │
     │ - Fix any layout issues                                                                                         │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ PHASE 3: PROFESSIONAL FEATURES (Week 5-6) - Polish                                                              │
     │                                                                                                                 │
     │ 🎯 My Work (Lead Programmer)                                                                                    │
     │                                                                                                                 │
     │ 1. PDF Report Generation                                                                                        │
     │ - Install jsPDF: npm install jspdf                                                                              │
     │ - Create utils/pdfExport.js: multi-page report generator                                                        │
     │ - Capture Chart.js canvases at 2x resolution                                                                    │
     │ - Implement professional 5-page report structure:                                                               │
     │   - Page 1: Cover & summary                                                                                     │
     │   - Page 2: Portfolio allocation + key metrics                                                                  │
     │   - Page 3: Detailed metrics table                                                                              │
     │   - Page 4: Monte Carlo projections chart                                                                       │
     │   - Page 5: Sector/factor analysis + appendix                                                                   │
     │ - Add branding, headers, footers, disclaimers                                                                   │
     │ - Create "Export PDF" button in App.jsx                                                                         │
     │                                                                                                                 │
     │ 2. Advanced Portfolio Features                                                                                  │
     │ - Add portfolio comparison mode (multiple portfolios)                                                           │
     │ - Historical performance tracking                                                                               │
     │ - Save/load portfolio configurations (localStorage)                                                             │
     │                                                                                                                 │
     │ 🤝 Gemini's Work (Helper)                                                                                       │
     │                                                                                                                 │
     │ 1. CSV Portfolio Import                                                                                         │
     │ - Create PortfolioImport.jsx: CSV upload component                                                              │
     │ - Parse standard broker CSV formats                                                                             │
     │ - Auto-detect column mappings (ticker, quantity, cost)                                                          │
     │ - Validate and convert to portfolio weights                                                                     │
     │ - Handle upload errors gracefully                                                                               │
     │                                                                                                                 │
     │ 2. Documentation Updates                                                                                        │
     │ - Update CLAUDE.md with new features                                                                            │
     │ - Add examples for multi-asset portfolios                                                                       │
     │ - Document CSV import format                                                                                    │
     │ - Add troubleshooting section                                                                                   │
     │                                                                                                                 │
     │ 3. UI Enhancements                                                                                              │
     │ - Add help tooltips throughout app                                                                              │
     │ - Create onboarding tutorial/walkthrough                                                                        │
     │ - Improve mobile experience                                                                                     │
     │ - Add keyboard shortcuts for power users                                                                        │
     │                                                                                                                 │
     │ 4. Final Testing & QA                                                                                           │
     │ - Cross-browser testing (Chrome, Firefox, Safari, Edge)                                                         │
     │ - Mobile testing (iOS, Android)                                                                                 │
     │ - PDF export quality testing                                                                                    │
     │ - Performance optimization                                                                                      │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ FUTURE PHASE (Post-Launch) - Brokerage Integration                                                              │
     │                                                                                                                 │
     │ When User Demand Validated:                                                                                     │
     │ - Implement SnapTrade integration for automatic portfolio import                                                │
     │ - OAuth flow for brokerage authentication                                                                       │
     │ - Real-time portfolio sync                                                                                      │
     │ - Cost: Start with free tier (5 users), scale to $1.50/user/month                                               │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ TECHNICAL DECISIONS                                                                                             │
     │                                                                                                                 │
     │ Asset Class Support (Phase 1)                                                                                   │
     │                                                                                                                 │
     │ - Stocks/ETFs: yfinance (free, already implemented)                                                             │
     │ - Crypto: yfinance with -USD suffix (BTC-USD, ETH-USD)                                                          │
     │ - Bonds: FRED API via pandas_datareader (free, Treasury bonds only)                                             │
     │ - Corporate bonds: Defer to future (requires paid data)                                                         │
     │                                                                                                                 │
     │ Sector Data (Phase 2)                                                                                           │
     │                                                                                                                 │
     │ - Stocks: yfinance Ticker.info['sector'] (free, easy)                                                           │
     │ - ETFs: Skip detailed breakdown in MVP (treat as single sector)                                                 │
     │ - Future: Add etfpy library for ETF sector weightings                                                           │
     │                                                                                                                 │
     │ Factor Analysis (Phase 2)                                                                                       │
     │                                                                                                                 │
     │ - Approach: Characteristic-based (P/B, PEG, momentum, size)                                                     │
     │ - Alternative: Regression-based Fama-French (defer to future)                                                   │
     │ - Why: Simpler implementation, faster results, adequate for MVP                                                 │
     │                                                                                                                 │
     │ Drag-and-Drop Library                                                                                           │
     │                                                                                                                 │
     │ - Choice: chartjs-plugin-dragdata for pie chart segments                                                        │
     │ - Alternative: HTML5 native for stock list → portfolio                                                          │
     │ - Why: Direct chart interaction feels more intuitive                                                            │
     │                                                                                                                 │
     │ PDF Generation                                                                                                  │
     │                                                                                                                 │
     │ - Library: jsPDF (30k+ stars, best Chart.js integration)                                                        │
     │ - Alternative: @react-pdf/renderer (more complex, overkill)                                                     │
     │ - Why: Fastest implementation, proven with Chart.js                                                             │
     │                                                                                                                 │
     │ Brokerage Integration                                                                                           │
     │                                                                                                                 │
     │ - MVP: CSV upload only (zero cost, fast implementation)                                                         │
     │ - Future: SnapTrade ($1.50/user/month when validated)                                                           │
     │ - Why: Minimize upfront investment, validate demand first                                                       │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ DELIVERABLES BY PHASE                                                                                           │
     │                                                                                                                 │
     │ Phase 1 Deliverables:                                                                                           │
     │                                                                                                                 │
     │ - ✅ Multi-asset support (stocks, ETFs, crypto)                                                                  │
     │ - ✅ Interactive weight management (drag pie chart)                                                              │
     │ - ✅ Dollar value projections (initial investment + contributions)                                               │
     │ - ✅ Stock selector with drag-and-drop                                                                           │
     │ - ✅ Auto-equal weight division                                                                                  │
     │ - ✅ Real-time weight validation                                                                                 │
     │                                                                                                                 │
     │ Phase 2 Deliverables:                                                                                           │
     │                                                                                                                 │
     │ - ✅ Sector breakdown visualization                                                                              │
     │ - ✅ Factor exposure analysis (4 factors)                                                                        │
     │ - ✅ Larger, properly-sized charts                                                                               │
     │ - ✅ Asset type badges/indicators                                                                                │
     │ - ✅ Enhanced error handling                                                                                     │
     │                                                                                                                 │
     │ Phase 3 Deliverables:                                                                                           │
     │                                                                                                                 │
     │ - ✅ Professional PDF reports (downloadable)                                                                     │
     │ - ✅ CSV portfolio import                                                                                        │
     │ - ✅ Save/load portfolios                                                                                        │
     │ - ✅ Complete documentation                                                                                      │
     │ - ✅ Production-ready polish                                                                                     │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ ESTIMATED TIMELINE                                                                                              │
     │                                                                                                                 │
     │ - Phase 1: 2 weeks (40-50 hours total, split between us)                                                        │
     │ - Phase 2: 2 weeks (30-40 hours total)                                                                          │
     │ - Phase 3: 2 weeks (30-35 hours total)                                                                          │
     │ - Total: 6 weeks to full professional platform                                                                  │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ RISK MITIGATION                                                                                                 │
     │                                                                                                                 │
     │ Potential Challenges:                                                                                           │
     │ 1. chartjs-plugin-dragdata compatibility → Test early, have fallback                                            │
     │ 2. PDF chart quality → Render at 2x resolution, test extensively                                                │
     │ 3. Asset type detection accuracy → Use yfinance quoteType + pattern fallback                                    │
     │ 4. Factor data availability → Graceful degradation for missing data                                             │
     │                                                                                                                 │
     │ Dependencies to Add:                                                                                            │
     │ - chartjs-plugin-dragdata (frontend)                                                                            │
     │ - jspdf (frontend)                                                                                              │
     │ - etfpy (backend, optional)                                                                                     │
     │ - pandas_datareader (backend, for FRED bonds)                                                                   │
     │                                                                                                                 │
     │ ---                                                                                                             │
     │ SUCCESS METRICS                                                                                                 │
     │                                                                                                                 │
     │ - Users can build portfolios with 5+ asset types                                                                │
     │ - Weight management has zero errors (always sums to 100%)                                                       │
     │ - PDF reports generate in <3 seconds                                                                            │
     │ - Sector/factor analysis loads in <2 seconds                                                                    │
     │ - Mobile responsive on all major devices                                                                        │
     │ - 95%+ uptime on production deployment