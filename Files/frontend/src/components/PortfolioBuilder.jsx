import React from 'react';
import { Pie } from 'react-chartjs-2';

function PortfolioBuilder({ portfolio, onDrop, onWeightChange, onRemoveStock }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const stockData = e.dataTransfer.getData('stock');
    if (stockData) {
      const stock = JSON.parse(stockData);
      onDrop(stock);
    }
  };

  const handleWeightInputChange = (index, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      onWeightChange(index, numValue);
    }
  };

  // Calculate total weight for validation
  const totalWeight = portfolio.weights.reduce((sum, w) => sum + w, 0);
  const isValidWeight = Math.abs(totalWeight - 1.0) < 0.01;

  // Generate colors for pie chart
  const generateColors = (count) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#F97316', // orange
      '#6366F1', // indigo
      '#84CC16', // lime
    ];
    return portfolio.tickers.map((_, i) => colors[i % colors.length]);
  };

  // Pie chart data
  const chartData = {
    labels: portfolio.tickers,
    datasets: [
      {
        data: portfolio.weights,
        backgroundColor: generateColors(portfolio.tickers.length),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = (value * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Portfolio</h3>

      {/* Drop Zone */}
      {portfolio.tickers.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium">Drop stocks here to build your portfolio</p>
            <p className="text-sm text-gray-400 mt-2">Drag assets from the left panel</p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex-1 flex flex-col space-y-4"
        >
          {/* Portfolio List */}
          <div className="space-y-2">
            {portfolio.tickers.map((ticker, index) => (
              <div
                key={`${ticker}-${index}`}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 font-semibold text-gray-900">{ticker}</div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={portfolio.weights[index].toFixed(3)}
                    onChange={(e) => handleWeightInputChange(index, e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => onRemoveStock(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label="Remove stock"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Weight Validation */}
          <div className="text-sm">
            {!isValidWeight ? (
              <div className="text-red-600 bg-red-50 px-3 py-2 rounded">
                ⚠️ Weights must sum to 1.0 (currently: {totalWeight.toFixed(3)})
              </div>
            ) : (
              <div className="text-green-600 bg-green-50 px-3 py-2 rounded">
                ✓ Weights are valid (sum: 1.0)
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-800 mb-3">Allocation</h4>
            <div style={{ height: '300px' }}>
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioBuilder;
