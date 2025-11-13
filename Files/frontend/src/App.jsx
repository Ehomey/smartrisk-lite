import React, { useState } from 'react';
import axios from 'axios';
import StockSelector from './components/StockSelector';
import PortfolioBuilder from './components/PortfolioBuilder';
import ChartArea from './components/ChartArea';
import MetricsTable from './components/MetricsTable';
import SummaryBox from './components/SummaryBox';
import ProjectionSlider from './components/ProjectionSlider';
import AdvancedProjections from './components/AdvancedProjections';
import DataSourceInfo from './components/DataSourceInfo';

function App() {
    const [portfolio, setPortfolio] = useState({ tickers: [], weights: [] });
    const [portfolioData, setPortfolioData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [dataSource, setDataSource] = useState('yfinance');
    const [apiKey, setApiKey] = useState('');

    const analyzePortfolio = async (tickers, weights, dataSource, apiKey) => {
        setLoading(true);
        setError(null);
        setPortfolioData(null);
        setLoadingMessage('Fetching stock data...');

        try {
            const headers = {};
            if (dataSource) {
                headers['X-Data-Source'] = dataSource;
            }
            if (apiKey) {
                headers['X-AlphaVantage-Key'] = apiKey;
            }

            setLoadingMessage('Analyzing portfolio...');
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await axios.post(`${apiUrl}/analyze_portfolio`, {
                tickers,
                weights,
            }, {
                headers,
                timeout: 60000 // 60 second timeout
            });

            if (response.data.error) {
                setError(response.data.error);
                setLoading(false);
                return;
            }

            setPortfolioData(response.data);
            setLoadingMessage('');
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError('Request timed out. The server might be processing a large portfolio. Please try again with fewer tickers.');
            } else if (err.response) {
                setError(`Server error: ${err.response.data?.error || err.response.statusText}`);
            } else if (err.request) {
                setError('Cannot connect to the backend server. Please make sure the backend is running on http://localhost:8000');
            } else {
                setError(`Error: ${err.message}`);
            }
        }
        setLoading(false);
        setLoadingMessage('');
    };

    // Portfolio management functions
    const handleStockDrop = (stock) => {
        // Check if stock already exists
        if (portfolio.tickers.includes(stock.ticker)) {
            setError(`${stock.ticker} is already in your portfolio`);
            setTimeout(() => setError(null), 3000);
            return;
        }

        // Add stock and recalculate weights (equal distribution)
        const newTickers = [...portfolio.tickers, stock.ticker];
        const newWeight = 1.0 / newTickers.length;
        const newWeights = newTickers.map(() => newWeight);

        setPortfolio({ tickers: newTickers, weights: newWeights });
        setError(null);
    };

    const handleWeightChange = (index, newWeight) => {
        const newWeights = [...portfolio.weights];
        newWeights[index] = newWeight;
        setPortfolio({ ...portfolio, weights: newWeights });
    };

    const handleRemoveStock = (index) => {
        const newTickers = portfolio.tickers.filter((_, i) => i !== index);

        if (newTickers.length === 0) {
            setPortfolio({ tickers: [], weights: [] });
        } else {
            // Recalculate weights (equal distribution)
            const newWeight = 1.0 / newTickers.length;
            const newWeights = newTickers.map(() => newWeight);
            setPortfolio({ tickers: newTickers, weights: newWeights });
        }
    };

    const handleAnalyze = () => {
        if (portfolio.tickers.length === 0) {
            setError('Please add at least one stock to your portfolio');
            return;
        }

        const totalWeight = portfolio.weights.reduce((sum, w) => sum + w, 0);
        if (Math.abs(totalWeight - 1.0) > 0.01) {
            setError('Portfolio weights must sum to 1.0');
            return;
        }

        analyzePortfolio(portfolio.tickers, portfolio.weights, dataSource, apiKey);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
            <header className="bg-white shadow-md border-b-4 border-blue-500">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-center text-blue-600">SmartRisk Lite</h1>
                    <p className="text-center text-gray-600 mt-2">Portfolio Risk Analysis Tool</p>
                </div>
            </header>

            <main className="container mx-auto p-4 py-8">
                {/* Portfolio Builder Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <StockSelector />
                    <PortfolioBuilder
                        portfolio={portfolio}
                        onDrop={handleStockDrop}
                        onWeightChange={handleWeightChange}
                        onRemoveStock={handleRemoveStock}
                    />
                </div>

                {/* Data Source Settings */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">Data Source Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700 mb-2">
                                Data Provider
                            </label>
                            <select
                                id="dataSource"
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                            >
                                <option value="yfinance">Yahoo Finance (Free, No API Key)</option>
                                <option value="alpha_vantage">Alpha Vantage (Requires API Key)</option>
                            </select>
                        </div>

                        {dataSource === 'alpha_vantage' && (
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                                    Alpha Vantage API Key
                                </label>
                                <input
                                    type="text"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your API key"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Alpha Vantage Warning */}
                    {dataSource === 'alpha_vantage' && (
                        <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800">Alpha Vantage Limitations</h3>
                                    <div className="mt-2 text-sm text-amber-700">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li><strong>25 API calls per day</strong> limit (free tier)</li>
                                            <li><strong>5 calls per minute</strong> rate limit</li>
                                            <li>Portfolio automatically falls back to Yahoo Finance if limits are exceeded</li>
                                            <li>Results are cached for 24 hours to minimize API usage</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Analyze Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || portfolio.tickers.length === 0}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Portfolio'}
                    </button>
                </div>

                {/* Results Section */}
                <div className="space-y-8">
                        {loading && (
                            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-lg p-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                                <p className="text-gray-600 font-medium">{loadingMessage}</p>
                                <p className="text-gray-400 text-sm mt-2">This may take a few moments...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-md" role="alert">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-bold">Error</h3>
                                        <p className="text-sm mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {portfolioData && !loading && (
                            <>
                                {/* Warning Message for Partial Failures */}
                                {portfolioData.warning && (
                                    <div className="bg-amber-50 border-l-4 border-amber-400 text-amber-800 px-6 py-4 rounded-lg shadow-md mb-6" role="alert">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-bold">Warning</h3>
                                                <p className="text-sm mt-1">{portfolioData.warning}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Data Source Information */}
                                {portfolioData.data_sources && (
                                    <DataSourceInfo dataSources={portfolioData.data_sources} />
                                )}

                                {/* Portfolio Summary */}
                                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                                    <SummaryBox summary={portfolioData.summary} />
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                                    <MetricsTable data={portfolioData} />
                                </div>

                                {/* New Projection Components */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <ProjectionSlider projections={portfolioData.projections} />
                                    <AdvancedProjections projections={portfolioData.projections} />
                                </div>
                            </>
                        )}

                        {!portfolioData && !loading && !error && (
                            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
                                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Analysis Yet</h3>
                                <p className="text-gray-600">Drag stocks into your portfolio and click "Analyze Portfolio" to get started.</p>
                            </div>
                        )}
                    </div>
            </main>

            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
                    <p>SmartRisk Lite - Portfolio Risk Analysis © {new Date().getFullYear()}</p>
                    <p className="mt-2 text-xs text-gray-500">
                        Disclaimer: This tool is for educational purposes only. Not financial advice.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
