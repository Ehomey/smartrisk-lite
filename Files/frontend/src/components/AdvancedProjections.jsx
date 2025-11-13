import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdvancedProjections({ projections, initialInvestment = 10000 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!projections || !projections.percentiles) {
    return null;
  }

  const { years, percentiles } = projections;
  const { p10, p50, p90, mean } = percentiles;

  // Prepare chart data
  const chartData = {
    labels: years.map(year => `Year ${year}`),
    datasets: [
      {
        label: '90th Percentile (Optimistic)',
        data: p90,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: '+1',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2
      },
      {
        label: '50th Percentile (Median)',
        data: p50,
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: '+1',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3
      },
      {
        label: '10th Percentile (Pessimistic)',
        data: p10,
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2
      },
      {
        label: 'Mean (Average)',
        data: mean,
        borderColor: 'rgba(168, 85, 247, 0.8)',
        backgroundColor: 'rgba(168, 85, 247, 0)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
        borderDash: [5, 5]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Monte Carlo Projection Bands',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const returnPct = ((value - initialInvestment) / initialInvestment * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${returnPct >= 0 ? '+' : ''}${returnPct}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + (value / 1000).toFixed(0) + 'k';
          }
        },
        title: {
          display: true,
          text: 'Portfolio Value ($)',
          font: {
            size: 12
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Investment Horizon',
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
      {/* Collapsible Header */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Advanced Projections</h3>
        <button
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
            This chart shows the range of possible outcomes for your portfolio based on {projections.percentiles.p10.length} years of Monte Carlo simulation.
            The shaded areas represent the uncertainty range between different percentiles.
          </p>

          {/* Chart Container */}
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Legend Explanation */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-2">Understanding the Chart</h4>
            <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-1">
              <li><strong>P90 (Green):</strong> Only 10% of simulations performed better than this outcome</li>
              <li><strong>P50 (Blue):</strong> Median outcome - half of simulations were above, half below</li>
              <li><strong>P10 (Red):</strong> Only 10% of simulations performed worse than this outcome</li>
              <li><strong>Mean (Purple, dashed):</strong> Average outcome across all simulations</li>
            </ul>
          </div>

          {/* Statistical Details */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-400/60">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Historical Context</h4>
            <p className="text-xs text-blue-800 dark:text-blue-100">
              <strong>Historical CAGR:</strong> {(projections.cagr * 100).toFixed(2)}%
              <span className="ml-2 text-blue-700 dark:text-blue-200">
                (Compound Annual Growth Rate based on your portfolio's actual historical performance)
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedProjections;
