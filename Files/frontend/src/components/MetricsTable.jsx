import React from 'react';

const MetricsTable = ({ data }) => {
    const { individual_metrics, portfolio_metrics } = data;

    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Risk & Return Metrics</h3>
            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Annual Return</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Volatility</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharpe Ratio</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(individual_metrics).map(([ticker, metrics]) => (
                            <tr key={ticker}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticker}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(metrics.expected_annual_return * 100).toFixed(2)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(metrics.annual_volatility * 100).toFixed(2)}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metrics.sharpe_ratio.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Portfolio</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(portfolio_metrics.expected_annual_return * 100).toFixed(2)}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(portfolio_metrics.annual_volatility * 100).toFixed(2)}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{portfolio_metrics.sharpe_ratio.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {portfolio_metrics.horizons && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-md font-medium text-gray-800">Investment Horizons (Cumulative Returns)</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-center">
                        <div>
                            <p className="text-sm text-gray-500">1 Year</p>
                            <p className="text-lg font-semibold text-green-600">{(portfolio_metrics.horizons['1y'] * 100).toFixed(2)}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">3 Years</p>
                            <p className="text-lg font-semibold text-green-600">{(portfolio_metrics.horizons['3y'] * 100).toFixed(2)}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">5 Years</p>
                            <p className="text-lg font-semibold text-green-600">{(portfolio_metrics.horizons['5y'] * 100).toFixed(2)}%</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricsTable;
