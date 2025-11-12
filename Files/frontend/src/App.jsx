import React, { useState } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import ChartArea from './components/ChartArea';
import MetricsTable from './components/MetricsTable';
import SummaryBox from './components/SummaryBox';
import ProjectionSlider from './components/ProjectionSlider';
import AdvancedProjections from './components/AdvancedProjections';

function App() {
    const [portfolioData, setPortfolioData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('');

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
            <header className="bg-white shadow-md border-b-4 border-blue-500">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-center text-blue-600">SmartRisk Lite</h1>
                    <p className="text-center text-gray-600 mt-2">Portfolio Risk Analysis Tool</p>
                </div>
            </header>

            <main className="container mx-auto p-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Input Parameters</h2>
                        <InputForm onSubmit={analyzePortfolio} />
                    </div>

                    <div className="md:col-span-2 space-y-8">
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
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                                        <ChartArea
                                            tickers={portfolioData.tickers}
                                            weights={portfolioData.weights}
                                        />
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                                        <SummaryBox summary={portfolioData.summary} />
                                    </div>
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
                                <p className="text-gray-600">Enter your portfolio details on the left and click "Analyze Portfolio" to get started.</p>
                            </div>
                        )}
                    </div>
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
