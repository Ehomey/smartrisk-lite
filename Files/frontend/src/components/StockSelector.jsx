import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StockSelector() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetClassFilter, setAssetClassFilter] = useState('All');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    let filtered = stocks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (stock) =>
          stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply asset class filter
    if (assetClassFilter !== 'All') {
      filtered = filtered.filter(stock => stock.assetClass === assetClassFilter);
    }

    // Apply sector filter
    if (sectorFilter !== 'All') {
      filtered = filtered.filter(stock => stock.sector === sectorFilter);
    }

    setFilteredStocks(filtered);
  }, [searchTerm, assetClassFilter, sectorFilter, stocks]);

  const fetchStocks = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await axios.get(`${apiUrl}/popular_stocks`);
      setStocks(response.data);
      setFilteredStocks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load stocks');
      setLoading(false);
    }
  };

  const handleDragStart = (e, stock) => {
    e.dataTransfer.setData('stock', JSON.stringify(stock));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (loading) {
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

  // Get unique asset classes and sectors for dropdowns
  const assetClasses = ['All', ...new Set(stocks.map(s => s.assetClass).filter(Boolean))];
  const sectors = ['All', ...new Set(stocks.map(s => s.sector).filter(Boolean))];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 h-full flex flex-col transition-colors">
      <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Available Assets</h3>

      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search stocks, ETFs, crypto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <select
            value={assetClassFilter}
            onChange={(e) => setAssetClassFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {assetClasses.map(ac => (
              <option key={ac} value={ac}>{ac}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Counter */}
      <div className="mb-2 text-sm text-gray-600 dark:text-slate-300">
        Showing {filteredStocks.length} of {stocks.length} assets
      </div>

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-96">
        {filteredStocks.length === 0 ? (
          <div className="text-gray-500 dark:text-slate-400 text-sm text-center py-4">No assets found</div>
        ) : (
          filteredStocks.map((stock) => (
            <div
              key={stock.ticker}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, stock)}
              className="p-3 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 cursor-move transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-slate-100">{stock.ticker}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 truncate">{stock.name}</div>
                </div>
                <div className="ml-2 flex flex-col gap-1">
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          <strong>Tip:</strong> Drag and drop assets into your portfolio on the right
        </p>
      </div>
    </div>
  );
}

export default StockSelector;
