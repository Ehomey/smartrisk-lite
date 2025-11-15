/**
 * MetricsTable.jsx
 *
 * Tabular display of risk and return metrics for individual assets
 * and the overall portfolio.
 *
 * Shows:
 * - Expected annual return (percentage)
 * - Annual volatility (standard deviation)
 * - Sharpe ratio (risk-adjusted return)
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Analysis data from backend
 * @param {Object} props.data.individual_metrics - Per-ticker metrics
 * @param {Object} props.data.portfolio_metrics - Aggregated portfolio metrics
 * @returns {JSX.Element} Metrics table
 */

import React from 'react';

const MetricsTable = ({ data }) => {
    const { individual_metrics, portfolio_metrics } = data;

    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-slate-100">Risk & Return Metrics</h3>
            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Ticker</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Expected Annual Return</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Annual Volatility</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sharpe Ratio</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
                        {Object.entries(individual_metrics).map(([ticker, metrics]) => (
                            <tr key={ticker}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{ticker}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{(metrics.expected_annual_return * 100).toFixed(2)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{(metrics.annual_volatility * 100).toFixed(2)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{metrics.sharpe_ratio.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-50 dark:bg-slate-800 font-bold">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">Portfolio</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{(portfolio_metrics.expected_annual_return * 100).toFixed(2)}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{(portfolio_metrics.annual_volatility * 100).toFixed(2)}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{portfolio_metrics.sharpe_ratio.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MetricsTable;
