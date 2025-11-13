# Backend Monte Carlo Test Plan

## Variance/mean computation sanity
1. Deterministic single asset (constant daily return) must produce exact percentile = theoretical.
2. Mixed deterministic assets (different constant returns) must see chunk-size consistency.
3. Random multi-asset run: chunk size 37 vs 500 with same seed must match percentiles (rtol <= 2%).
4. Single asset positive distribution returns positive values in each percentile list.
5. Chunk size larger than path count still produces values.

## External comparison
6. Compare multi-asset random run against naive (full matrix) simulation with same seed and confirm percentiles within 2%.
7. Compare deterministic scenario to closed-form CAGR for multi-year horizon.

## Error handling (future work)
8. Validate bad inputs (weights not summing, etc.) are rejected (not yet automated).
