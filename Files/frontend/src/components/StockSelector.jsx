/**
 * StockSelector.jsx
 *
 * Asset selection component with search, filtering, and pagination capabilities.
 * Displays a curated list of stocks, ETFs, and crypto assets that users can
 * drag-and-drop or click to add to their portfolio.
 *
 * Key Features:
 * - Paginated asset list with 60 items per page
 * - Dual filtering by asset class (Stock/ETF/Crypto) and sector
 * - Live search within loaded assets
 * - Remote market search via yfinance API for unlisted tickers
 * - Drag-and-drop support for portfolio building
 * - Click-to-add quick action buttons
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

// Number of assets to fetch per page
const PAGE_SIZE = 60;

/**
 * StockSelector Component
 *
 * @param {Object} props - Component props
 * @param {Function} props.onAddAsset - Callback fired when user adds an asset to portfolio
 * @returns {JSX.Element} Stock selector UI with search and filters
 */
function StockSelector({ onAddAsset }) {
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_URL || '/api', []);

  // Asset data and filtering state
  const [stocks, setStocks] = useState([]);                    // All loaded stocks from API
  const [filteredStocks, setFilteredStocks] = useState([]);    // Client-side filtered results
  const [searchTerm, setSearchTerm] = useState('');             // Search query string
  const [assetClassFilter, setAssetClassFilter] = useState('All'); // Stock/ETF/Crypto filter
  const [sectorFilter, setSectorFilter] = useState('All');      // Sector filter
  const [assetClassOptions, setAssetClassOptions] = useState(['All']); // Available asset classes
  const [sectorOptions, setSectorOptions] = useState(['All']);  // Available sectors

  // Pagination state
  const [page, setPage] = useState(1);                          // Current page number
  const [hasMore, setHasMore] = useState(false);                // Whether more pages exist
  const [totalCount, setTotalCount] = useState(0);              // Total asset count

  // Loading and error state
  const [loading, setLoading] = useState(true);                 // Initial load state
  const [loadingMore, setLoadingMore] = useState(false);        // Pagination load state
  const [error, setError] = useState(null);                     // Error messages

  // Remote search state
  const [searchResult, setSearchResult] = useState(null);       // Result from yfinance lookup
  const [searching, setSearching] = useState(false);            // Remote search loading
  const [searchError, setSearchError] = useState(null);         // Remote search errors

  /**
   * Fetches assets from the backend API with pagination and filtering.
   * Can be called for initial load or "Load More" pagination.
   *
   * @param {number} pageToFetch - Page number to fetch (1-indexed)
   * @param {boolean} replace - If true, replaces existing stocks; if false, appends
   */
  const fetchStocks = useCallback(
    async (pageToFetch = 1, replace = false) => {
      if (pageToFetch === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      try {
        const params = {
          page: pageToFetch,
          limit: PAGE_SIZE,
        };
        if (assetClassFilter !== 'All') {
          params.asset_type = assetClassFilter;
        }
        if (sectorFilter !== 'All') {
          params.sector = sectorFilter;
        }

        const response = await axios.get(`${apiBaseUrl}/popular_stocks`, { params });
        const payload = response.data || {};
        const items = payload.items ?? (Array.isArray(payload) ? payload : []);
        const total = payload.total ?? items.length;

        if (payload.asset_classes?.length) {
          setAssetClassOptions(['All', ...payload.asset_classes]);
        }
        if (payload.sectors?.length) {
          setSectorOptions(['All', ...payload.sectors]);
        }

        setStocks((prev) => (replace ? items : [...prev, ...items]));
        setTotalCount(total);
        setHasMore(pageToFetch * PAGE_SIZE < total);
        setPage(pageToFetch);
      } catch (err) {
        setError('Failed to load assets');
      } finally {
        if (pageToFetch === 1) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [apiBaseUrl, assetClassFilter, sectorFilter]
  );

  // Fetch initial assets on mount and when filters change
  useEffect(() => {
    fetchStocks(1, true);
  }, [fetchStocks]);

  // Client-side search filtering
  useEffect(() => {
    setSearchResult(null);
    setSearchError(null);
    let filtered = stocks;
    if (searchTerm) {
      filtered = filtered.filter(
        (stock) =>
          stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStocks(filtered);
  }, [searchTerm, stocks]);

  /**
   * Initiates drag operation when user starts dragging an asset.
   *
   * @param {DragEvent} e - Drag event
   * @param {Object} stock - Stock data to transfer
   */
  const handleDragStart = (e, stock) => {
    e.dataTransfer.setData('stock', JSON.stringify(stock));
    e.dataTransfer.effectAllowed = 'copy';
  };

  /**
   * Handles direct click-to-add action for an asset.
   *
   * @param {MouseEvent} e - Click event
   * @param {Object} stock - Stock data to add
   */
  const handleAddClick = (e, stock) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddAsset) {
      onAddAsset(stock);
    }
  };

  /**
   * Loads the next page of assets from the server.
   */
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchStocks(page + 1);
    }
  };

  /**
   * Searches for a ticker symbol via the backend's yfinance integration.
   * This allows users to add assets not in the curated list.
   */
  const handleRemoteSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const response = await axios.get(`${apiBaseUrl}/search_assets`, {
        params: { query: searchTerm.trim() },
      });
      setSearchResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Asset not found';
      setSearchResult(null);
      setSearchError(detail);
    } finally {
      setSearching(false);
    }
  };

  const isInitialLoading = loading && stocks.length === 0;

  if (isInitialLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Available Assets</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Available Assets</h3>
        <div className="text-red-600 dark:text-red-300 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 h-full flex flex-col transition-colors">
      <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Available Assets</h3>

      {/* Search Input */}
      <div className="mb-3">
        <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
          Search
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search stocks, ETFs, crypto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={handleRemoteSearch}
            disabled={!searchTerm.trim() || searching}
            className="px-3 py-2 text-sm font-semibold rounded-md border border-blue-500 text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {searching ? 'Searching…' : 'Search Market'}
          </button>
        </div>
        {searchError && <p className="mt-1 text-xs text-red-500">{searchError}</p>}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
            Asset Class
          </label>
          <select
            value={assetClassFilter}
            onChange={(e) => setAssetClassFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {assetClassOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">
            Sector
          </label>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {sectorOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Counter */}
      <div className="mb-2 text-sm text-gray-600 dark:text-slate-300">
        Showing {filteredStocks.length} of {totalCount} assets
      </div>

      {/* Remote search result */}
      {searchResult && (
        <div className="mb-3 p-3 border border-blue-200 dark:border-blue-500/40 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">{searchResult.ticker}</p>
            <p className="text-xs text-gray-700 dark:text-slate-300">{searchResult.name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {searchResult.assetClass} • {searchResult.sector}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => handleAddClick(e, searchResult)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
          >
            + Add
          </button>
        </div>
      )}

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-96">
        {filteredStocks.length === 0 ? (
          <div className="text-gray-500 dark:text-slate-400 text-sm text-center py-4">No assets found</div>
        ) : (
          filteredStocks.map((stock) => (
            <div
              key={`${stock.ticker}-${stock.assetClass}-${stock.sector}`}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, stock)}
              className="p-3 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 cursor-move transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-slate-100">{stock.ticker}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 truncate">{stock.name}</div>
                </div>
                <div className="ml-2 flex flex-col gap-1 items-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full text-center ${
                    stock.assetClass === 'Stock' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200' :
                    stock.assetClass === 'ETF' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200' :
                    stock.assetClass === 'Crypto' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200' :
                    'bg-gray-100 text-gray-700 dark:bg-slate-700/60 dark:text-slate-200'
                  }`}>
                    {stock.assetClass}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 text-center">
                    {stock.sector}
                  </span>
                  {onAddAsset && (
                    <button
                      type="button"
                      onClick={(e) => handleAddClick(e, stock)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {loadingMore && (
          <div className="flex justify-center py-3">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-3">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full py-2 border border-gray-300 dark:border-slate-700 rounded-md text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          <strong>Tip:</strong> Drag assets into your portfolio or tap “+ Add” on any card. Use “Search Market” to pull live ticker data.
        </p>
      </div>
    </div>
  );
}

export default StockSelector;
