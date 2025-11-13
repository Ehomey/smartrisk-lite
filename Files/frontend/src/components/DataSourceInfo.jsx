import React from 'react';

function DataSourceInfo({ dataSources }) {
  if (!dataSources || Object.keys(dataSources).length === 0) {
    return null;
  }

  // Group tickers by source
  const groupedSources = {};
  Object.entries(dataSources).forEach(([ticker, info]) => {
    const source = info.source;
    if (!groupedSources[source]) {
      groupedSources[source] = [];
    }
    groupedSources[source].push(ticker);
  });

  // Helper to get badge color based on source
  const getBadgeColor = (source) => {
    if (source === 'cache') return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-500/20 dark:text-green-100 dark:border-green-400/40';
    if (source === 'yfinance') return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/20 dark:text-blue-100 dark:border-blue-400/40';
    if (source === 'alpha_vantage') return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-500/20 dark:text-purple-100 dark:border-purple-400/40';
    if (source.includes('fallback')) return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-400/40';
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700';
  };

  // Helper to get icon based on source
  const getSourceIcon = (source) => {
    if (source === 'cache') {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (source.includes('fallback')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  };

  // Helper to get human-readable source name
  const getSourceName = (source) => {
    if (source === 'cache') return 'Cached Data (24h)';
    if (source === 'yfinance') return 'Yahoo Finance';
    if (source === 'alpha_vantage') return 'Alpha Vantage';
    if (source === 'yfinance (cached)') return 'Yahoo Finance (Cached)';
    if (source === 'alpha_vantage (cached)') return 'Alpha Vantage (Cached)';
    if (source.includes('fallback')) return 'Yahoo Finance (Fallback)';
    if (source.includes('cached')) {
      // Handle any other cached sources
      const originalSource = source.replace(' (cached)', '');
      return `${originalSource.charAt(0).toUpperCase() + originalSource.slice(1)} (Cached)`;
    }
    return source;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center mb-4">
        <svg className="h-6 w-6 text-gray-600 dark:text-slate-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Data Sources</h3>
      </div>

      <div className="space-y-3">
        {Object.entries(groupedSources).map(([source, tickers]) => (
          <div key={source} className="flex items-start">
            <div className={`flex items-center px-3 py-2 rounded-md border ${getBadgeColor(source)} min-w-[200px]`}>
              <span className="mr-2">{getSourceIcon(source)}</span>
              <span className="font-semibold text-sm">{getSourceName(source)}</span>
            </div>
            <div className="ml-3 flex-1">
              <div className="flex flex-wrap gap-2">
                {tickers.map((ticker) => (
                  <span key={ticker} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-medium">
                    {ticker}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info note */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
        <p className="text-xs text-gray-500 dark:text-slate-400">
          <strong>Note:</strong> Data is cached for 24 hours to minimize API usage.
          {Object.keys(groupedSources).some(s => s.includes('fallback')) && (
            <span className="text-amber-600 dark:text-amber-200"> Fallback occurred due to rate limits or errors with the primary source.</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default DataSourceInfo;
