/**
 * App.jsx
 *
 * Main application component for SmartRisk Lite portfolio analysis tool.
 * Manages portfolio state, theme preferences, data source configuration,
 * and orchestrates communication between child components.
 *
 * Key Features:
 * - Drag-and-drop portfolio builder
 * - Multi-source data fetching (Yahoo Finance, Alpha Vantage)
 * - Monte Carlo simulations with configurable path counts
 * - Dark mode theme toggle with localStorage persistence
 * - Real-time portfolio analysis with comprehensive risk metrics
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import StockSelector from './components/StockSelector';
import PortfolioBuilder from './components/PortfolioBuilder';
import ChartArea from './components/ChartArea';
import MetricsTable from './components/MetricsTable';
import SummaryBox from './components/SummaryBox';
import ProjectionSlider from './components/ProjectionSlider';
import AdvancedProjections from './components/AdvancedProjections';
import DataSourceInfo from './components/DataSourceInfo';
import ThemeToggle from './components/ThemeToggle';
import AboutInsights from './components/AboutInsights';

// Remote API endpoint for production deployment
const REMOTE_API_FALLBACK = 'https://smartrisk-lite-production.up.railway.app';

// Monte Carlo simulation path count options
const SIMULATION_OPTIONS = [
    { label: '5k', value: 5000 },
    { label: '10k', value: 10000 },
    { label: '20k', value: 20000 },
];

/**
 * Determines the appropriate API base URL based on environment and hostname.
 * Priority order:
 * 1. VITE_API_URL environment variable
 * 2. Local proxy (/api) for localhost development
 * 3. Remote production API as fallback
 *
 * @returns {string} The API base URL
 */
const resolveApiBase = () => {
    const envUrl = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim();
    if (envUrl) {
        return envUrl;
    }

    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host === 'localhost' || host === '127.0.0.1') {
            return '/api';
        }
    }

    return REMOTE_API_FALLBACK;
};

/**
 * Main App Component
 *
 * Manages the entire portfolio analysis workflow from asset selection
 * through analysis and results visualization.
 *
 * @returns {JSX.Element} The main application UI
 */
function App() {
    // Portfolio state: tickers and their corresponding weights
    const [portfolio, setPortfolio] = useState({ tickers: [], weights: [] });
    // Analysis results from backend API
    const [portfolioData, setPortfolioData] = useState(null);
    // Loading state for API requests
    const [loading, setLoading] = useState(false);
    // Error messages for user feedback
    const [error, setError] = useState(null);
    // Detailed loading status messages
    const [loadingMessage, setLoadingMessage] = useState('');
    // Selected data source: 'yfinance' or 'alpha_vantage'
    const [dataSource, setDataSource] = useState('yfinance');
    // Alpha Vantage API key (if using that data source)
    const [apiKey, setApiKey] = useState('');
    // Number of Monte Carlo simulation paths (5k, 10k, or 20k)
    const [simulationPaths, setSimulationPaths] = useState(SIMULATION_OPTIONS[0].value);
<<<<<<< HEAD
    const [initialInvestment, setInitialInvestment] = useState(10000);
    const [monthlyContribution, setMonthlyContribution] = useState(0);
    const [contributionFrequency, setContributionFrequency] = useState('monthly');
=======
    // Theme preference with localStorage persistence and system preference detection
>>>>>>> 0ad2c3ba15a78d7373b15e5b24fc1ee29d0d5dee
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedTheme = window.localStorage.getItem('sr-theme');
            if (storedTheme) {
                return storedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('sr-theme', theme);
        }
    }, [theme]);

    // Memoized API base URL (computed once on mount)
    const apiBaseUrl = useMemo(() => resolveApiBase(), []);

    /**
     * Analyzes a portfolio by sending tickers and weights to the backend API.
     * Handles data source configuration, loading states, and error scenarios.
     *
     * @param {string[]} tickers - Array of stock ticker symbols
     * @param {number[]} weights - Array of portfolio weights (must sum to 1.0)
     * @param {string} dataSource - Data source to use ('yfinance' or 'alpha_vantage')
     * @param {string} apiKey - API key for Alpha Vantage (if applicable)
     */
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
            const response = await axios.post(`${apiBaseUrl}/analyze_portfolio`, {
                tickers,
                weights,
                num_paths: simulationPaths,
                initial_investment: initialInvestment,
                monthly_contribution: monthlyContribution,
                contribution_frequency: contributionFrequency,
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
                setError(`Cannot connect to the backend server at ${apiBaseUrl}. Please ensure the service is reachable.`);
            } else {
                setError(`Error: ${err.message}`);
            }
        }
        setLoading(false);
        setLoadingMessage('');
    };

    /**
     * Toggles between light and dark theme modes.
     * Theme preference is automatically persisted to localStorage.
     */
    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    /**
     * Handles adding a new asset to the portfolio via drag-and-drop or click.
     * Prevents duplicate tickers and automatically recalculates weights for equal distribution.
     *
     * @param {Object} stock - Stock object with ticker, name, assetClass, and sector
     */
    const handleStockDrop = (stock) => {
        // Prevent duplicate tickers in the portfolio
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

    /**
     * Updates the weight of a specific asset in the portfolio.
     *
     * @param {number} index - Index of the asset to update
     * @param {number} newWeight - New weight value (0.0 to 1.0)
     */
    const handleWeightChange = (index, newWeight) => {
        const newWeights = [...portfolio.weights];
        newWeights[index] = newWeight;
        setPortfolio({ ...portfolio, weights: newWeights });
    };

    /**
     * Removes an asset from the portfolio and recalculates weights.
     * If all assets are removed, resets the portfolio to empty state.
     *
     * @param {number} index - Index of the asset to remove
     */
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

    /**
     * Validates portfolio configuration and triggers analysis.
     * Ensures at least one asset exists and weights sum to 1.0 before proceeding.
     */
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 transition-colors duration-300">
            <header className="bg-white/90 dark:bg-slate-950/80 backdrop-blur shadow-md border-b-4 border-blue-500 dark:border-blue-600 transition-colors">
                <div className="container mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">SmartRisk Lite</h1>
                        <p className="text-center md:text-left text-gray-600 dark:text-slate-300 mt-2">Portfolio Risk Analysis Tool</p>
                    </div>
                    <div className="flex justify-center md:justify-end">
                        <ThemeToggle theme={theme} onToggle={toggleTheme} />
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 py-8 transition-colors duration-300">
                {/* Portfolio Builder Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <StockSelector onAddAsset={handleStockDrop} />
                    <PortfolioBuilder
                        portfolio={portfolio}
                        onDrop={handleStockDrop}
                        onWeightChange={handleWeightChange}
                        onRemoveStock={handleRemoveStock}
                    />
                </div>

                {/* Investment Settings */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 max-w-2xl mx-auto mb-6 transition-colors">
                    <h3 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-4">Investment Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="initialInvestment" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                                Initial Investment ($)
                            </label>
                            <input
                                type="number"
                                id="initialInvestment"
                                min="1"
                                step="1000"
                                value={initialInvestment}
                                onChange={(e) => setInitialInvestment(parseFloat(e.target.value) || 10000)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="monthlyContribution" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                                Contribution Amount ($)
                            </label>
                            <input
                                type="number"
                                id="monthlyContribution"
                                min="0"
                                step="100"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="contributionFrequency" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                                Frequency
                            </label>
                            <select
                                id="contributionFrequency"
                                value={contributionFrequency}
                                onChange={(e) => setContributionFrequency(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border transition-colors"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="annually">Annually</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Data Source Settings */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 max-w-2xl mx-auto mb-6 transition-colors">
                    <h3 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-4">Data Source Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                                Data Provider
                            </label>
                            <select
                                id="dataSource"
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border transition-colors"
                            >
                                <option value="yfinance">Yahoo Finance (Free, No API Key)</option>
                                <option value="alpha_vantage">Alpha Vantage (Requires API Key)</option>
                            </select>
                        </div>

                        {dataSource === 'alpha_vantage' && (
                            <div>
                                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-2">
                                    Alpha Vantage API Key
                                </label>
                                <input
                                    type="text"
                                    id="apiKey"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your API key"
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    {/* Alpha Vantage Warning */}
                    {dataSource === 'alpha_vantage' && (
                        <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 dark:bg-amber-500/10 dark:border-amber-400/70 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-amber-400 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Alpha Vantage Limitations</h3>
                                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-100">
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

                {/* Simulation Settings */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 max-w-2xl mx-auto mb-6 transition-colors">
                    <h3 className="text-md font-medium text-gray-900 dark:text-slate-100 mb-2">Monte Carlo Simulations</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">
                        More paths produce smoother percentile bands but require extra processing time.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {SIMULATION_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                    simulationPaths === option.value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-slate-800/70'
                                        : 'border-gray-200 dark:border-slate-700'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="simulationPaths"
                                    value={option.value}
                                    checked={simulationPaths === option.value}
                                    onChange={() => setSimulationPaths(option.value)}
                                    className="mt-1 accent-blue-600"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                        {option.label} simulations
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-slate-400">
                                        {option.value.toLocaleString()} Monte Carlo paths
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Analyze Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || portfolio.tickers.length === 0}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Portfolio'}
                    </button>
                </div>

                {/* Results Section */}
                <div className="space-y-8">
                        {loading && (
                            <div className="flex flex-col justify-center items-center h-64 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 transition-colors">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                                <p className="text-gray-600 dark:text-slate-200 font-medium">{loadingMessage}</p>
                                <p className="text-gray-400 dark:text-slate-400 text-sm mt-2">This may take a few moments...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-md" role="alert">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-red-500 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-bold text-red-800 dark:text-red-200">Error</h3>
                                        <p className="text-sm mt-1 text-red-700 dark:text-red-200/80">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {portfolioData && !loading && (
                            <>
                                {/* Warning Message for Partial Failures */}
                                {portfolioData.warning && (
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 dark:border-amber-300 text-amber-800 dark:text-amber-100 px-6 py-4 rounded-lg shadow-md mb-6" role="alert">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-amber-400 dark:text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">Warning</h3>
                                                <p className="text-sm mt-1 text-amber-800 dark:text-amber-100/80">{portfolioData.warning}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Data Source Information */}
                                {portfolioData.data_sources && (
                                    <DataSourceInfo dataSources={portfolioData.data_sources} />
                                )}

                                {/* Portfolio Summary */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
                                    <SummaryBox summary={portfolioData.summary} />
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 transition-colors">
                                    <MetricsTable data={portfolioData} />
                                </div>

                                {/* New Projection Components */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <ProjectionSlider
                                        projections={portfolioData.projections}
                                        contributionSettings={portfolioData.contribution_settings}
                                    />
                                    <AdvancedProjections
                                        projections={portfolioData.projections}
                                        contributionSettings={portfolioData.contribution_settings}
                                    />
                                </div>
                            </>
                        )}

                        {!portfolioData && !loading && !error && (
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-slate-800 text-center transition-colors">
                                <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-800 dark:text-slate-100 mb-2">No Analysis Yet</h3>
                                <p className="text-gray-600 dark:text-slate-300">Drag stocks into your portfolio and click "Analyze Portfolio" to get started.</p>
                            </div>
                        )}
                    </div>

                <div className="max-w-3xl mx-auto mb-10">
                    <AboutInsights />
                </div>
            </main>

            <footer className="bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 mt-12 transition-colors">
                <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-slate-300 text-sm">
                    <p>SmartRisk Lite - Portfolio Risk Analysis © {new Date().getFullYear()}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                        Disclaimer: This tool is for educational purposes only. Not financial advice.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default App;
