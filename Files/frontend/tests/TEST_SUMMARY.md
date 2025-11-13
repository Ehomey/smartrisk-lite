# Frontend Component Tests – Summary

- **PortfolioBuilder**
  - Percentage inputs render correctly, changing a field normalizes weights, and the 100% warning appears when needed.
- **StockSelector**
  - Mocked axios responses confirm filtering works and the + Add button hands the asset back to the builder.
- **AboutInsights**
  - Accordion toggles open to reveal the glossary-style explanation for new investors.

Vitest output lives in esults_unit_tests.txt. Canvas warnings are expected because Chart.js wants a real browser canvas; assertions ignore the chart internals.
