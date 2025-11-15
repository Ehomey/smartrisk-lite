/**
 * ProjectionSlider.jsx
 *
 * Interactive slider component for exploring portfolio projections
 * across different time horizons (1-10 years).
 *
 * Key Features:
 * - Range slider for selecting investment horizon
 * - Real-time display of percentile outcomes (P10/P50/P90)
 * - Percentage return calculations
 * - Visual warning for long-term projections (>5 years)
 * - Always-visible disclaimer about projection uncertainty
 */

import React, { useState } from 'react';

<<<<<<< HEAD
function ProjectionSlider({ projections, contributionSettings }) {
=======
/**
 * ProjectionSlider Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.projections - Projection data with percentile arrays
 * @param {number} [props.initialInvestment=10000] - Starting portfolio value
 * @returns {JSX.Element} Interactive projection slider
 */
function ProjectionSlider({ projections, initialInvestment = 10000 }) {
>>>>>>> 0ad2c3ba15a78d7373b15e5b24fc1ee29d0d5dee
  const [selectedYear, setSelectedYear] = useState(5);

  if (!projections || !projections.percentiles) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Portfolio Projections</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Projection data unavailable. Please analyze a portfolio to view projections.
        </p>
      </div>
    );
  }

  const initialInvestment = contributionSettings?.initial_investment || 10000;
  const periodicContribution = contributionSettings?.periodic_contribution || 0;
  const frequency = contributionSettings?.contribution_frequency || 'monthly';

  // Get the index for the selected year (years are 1-indexed, array is 0-indexed)
  const yearIndex = selectedYear - 1;
  const p10Value = projections.percentiles.p10[yearIndex];
  const p50Value = projections.percentiles.p50[yearIndex];
  const p90Value = projections.percentiles.p90[yearIndex];

  // Calculate total contributions made by this year
  const contributionsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  const totalContributions = periodicContribution * contributionsPerYear * selectedYear;
  const totalInvested = initialInvestment + totalContributions;

  // Calculate returns as percentages (based on total invested)
  const p10Return = ((p10Value - totalInvested) / totalInvested) * 100;
  const p50Return = ((p50Value - totalInvested) / totalInvested) * 100;
  const p90Return = ((p90Value - totalInvested) / totalInvested) * 100;

  // Determine text color based on selected year
  const returnColorClass = selectedYear > 5 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300';

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
      <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Portfolio Projections</h3>

      {/* Slider Control */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="year-slider" className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Investment Horizon
          </label>
          <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">{selectedYear} Year{selectedYear > 1 ? 's' : ''}</span>
        </div>

        <input
          id="year-slider"
          type="range"
          min="1"
          max="10"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-1">
          <span>1 year</span>
          <span>10 years</span>
        </div>
      </div>

      {/* Projected Return Display */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800/70 rounded-lg border border-gray-200 dark:border-slate-800">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">Projected Median Value</p>
          <p className={`text-3xl font-bold ${returnColorClass}`}>
            ${p50Value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {p50Return >= 0 ? '+' : ''}{p50Return.toFixed(1)}% return over {selectedYear} year{selectedYear > 1 ? 's' : ''}
          </p>
        </div>

        {/* Investment Summary */}
        {periodicContribution > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 text-center">
            <p className="text-xs text-gray-600 dark:text-slate-400">
              Initial: ${initialInvestment.toLocaleString()} + Contributions: ${totalContributions.toLocaleString()} = Total Invested: ${totalInvested.toLocaleString()}
            </p>
          </div>
        )}

        {/* Percentile Range */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-gray-500 dark:text-slate-400 mb-1">Pessimistic (P10)</p>
              <p className="font-semibold text-gray-700 dark:text-slate-100">${p10Value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">({p10Return >= 0 ? '+' : ''}{p10Return.toFixed(1)}%)</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 mb-1">Median (P50)</p>
              <p className="font-semibold text-gray-700 dark:text-slate-100">${p50Value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">({p50Return >= 0 ? '+' : ''}{p50Return.toFixed(1)}%)</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-slate-400 mb-1">Optimistic (P90)</p>
              <p className="font-semibold text-gray-700 dark:text-slate-100">${p90Value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">({p90Return >= 0 ? '+' : ''}{p90Return.toFixed(1)}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer - Always Visible */}
      <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-400/60 rounded-lg p-3">
        <p className="text-xs text-yellow-800 dark:text-yellow-100">
          <strong>Important:</strong> Longer-term projections become less reliable; treat results beyond five years with caution.
          These projections are based on historical data and Monte Carlo simulation, and do not guarantee future performance.
        </p>
      </div>
    </div>
  );
}

export default ProjectionSlider;
