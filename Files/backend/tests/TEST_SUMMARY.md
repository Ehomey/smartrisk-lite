# Backend Monte Carlo Tests – Summary

- **Single Asset Truth Check**
  - Feed +0.1% daily returns and confirm every percentile matches the closed-form math.
- **Multi-Asset Chunk Sanity**
  - Run constant returns with chunk sizes 17 vs 500; percentiles stay identical.
- **Random Scenario Consistency**
  - Chunk 37 vs 500 on a stochastic 3-asset portfolio; differences stay under 2%.
- **Percentage Output Health**
  - 100% single-asset portfolio returns positive values for each year and percentile.
- **Chunk Size > Paths**
  - Even when chunk size is bigger than the path count, the run succeeds and outputs data.

See results_unit_tests.txt for the raw pytest log.
