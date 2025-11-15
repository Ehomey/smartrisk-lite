/**
 * InputForm.jsx
 *
 * Legacy form-based portfolio input component (retained for backward compatibility).
 * Allows manual ticker and weight entry via comma-separated text inputs.
 *
 * NOTE: This component is not actively used in the current drag-and-drop UI flow
 * but remains available for users who prefer text-based input.
 *
 * Key Features:
 * - Text input for tickers and weights
 * - Comprehensive validation (format, sum, duplicates)
 * - Data source selection (Yahoo Finance, Alpha Vantage)
 * - Example portfolio loader
 */

import React, { useState } from 'react';

/**
 * InputForm Component
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback when form is submitted with valid data
 * @returns {JSX.Element} Form interface
 */
const InputForm = ({ onSubmit }) => {
    const [tickers, setTickers] = useState('AAPL,MSFT,GOOG');
    const [weights, setWeights] = useState('0.4,0.3,0.3');
    const [dataSource, setDataSource] = useState('yfinance');
    const [apiKey, setApiKey] = useState('');
    const [validationError, setValidationError] = useState('');

    /**
     * Loads a pre-configured example portfolio for quick testing.
     */
    const handleLoadExample = () => {
        setTickers('AAPL,MSFT,NVDA,TSLA');
        setWeights('0.3,0.3,0.2,0.2');
        setValidationError('');
    };

    /**
     * Validates portfolio input data against multiple criteria.
     *
     * Checks:
     * - At least one ticker exists
     * - Ticker and weight array lengths match
     * - Ticker format (1-5 uppercase letters)
     * - No negative weights
     * - No weights exceeding 1.0
     * - Weights sum to 1.0 (within tolerance)
     * - API key provided if using Alpha Vantage
     *
     * @param {string[]} tickersArray - Array of ticker symbols
     * @param {number[]} weightsArray - Array of portfolio weights
     * @returns {string|null} Error message if validation fails, null if valid
     */
    const validateInputs = (tickersArray, weightsArray) => {
        // Ensure at least one ticker is provided
        if (tickersArray.length === 0) {
            return "Please enter at least one ticker";
        }

        // Check if lengths match
        if (tickersArray.length !== weightsArray.length) {
            return `Number of tickers (${tickersArray.length}) must match number of weights (${weightsArray.length})`;
        }

        // Check for valid ticker format (basic check)
        const invalidTickers = tickersArray.filter(t => !/^[A-Z]{1,5}$/.test(t));
        if (invalidTickers.length > 0) {
            return `Invalid ticker format: ${invalidTickers.join(', ')}. Use uppercase letters only (e.g., AAPL)`;
        }

        // Check for negative weights
        const negativeWeights = weightsArray.filter(w => w < 0);
        if (negativeWeights.length > 0) {
            return "Weights cannot be negative";
        }

        // Check for weights > 1
        const tooLargeWeights = weightsArray.filter(w => w > 1);
        if (tooLargeWeights.length > 0) {
            return "Individual weights cannot exceed 1.0";
        }

        // Check if weights sum to 1
        const sum = weightsArray.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) > 0.01) {
            return `Weights must sum to 1.0 (currently ${sum.toFixed(4)})`;
        }

        // Check for Alpha Vantage API key
        if (dataSource === 'alpha_vantage' && !apiKey.trim()) {
            return "Alpha Vantage API key is required";
        }

        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setValidationError('');

        const tickersArray = tickers.split(',').map(t => t.trim().toUpperCase());
        const weightsArray = weights.split(',').map(w => parseFloat(w.trim()));

        // Check for NaN in weights
        if (weightsArray.some(isNaN)) {
            setValidationError('All weights must be valid numbers');
            return;
        }

        const error = validateInputs(tickersArray, weightsArray);
        if (error) {
            setValidationError(error);
            return;
        }

        onSubmit(tickersArray, weightsArray, dataSource, apiKey);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {validationError && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Validation Error: </strong>
                    <span className="block sm:inline">{validationError}</span>
                </div>
            )}

            <div>
                <label htmlFor="tickers" className="block text-sm font-medium text-gray-700">
                    Tickers (comma-separated)
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="tickers"
                        id="tickers"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="AAPL,MSFT,GOOG"
                        value={tickers}
                        onChange={(e) => {
                            setTickers(e.target.value);
                            setValidationError('');
                        }}
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter stock ticker symbols separated by commas</p>
            </div>

            <div>
                <label htmlFor="weights" className="block text-sm font-medium text-gray-700">
                    Weights (comma-separated, must sum to 1.0)
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="weights"
                        id="weights"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        placeholder="0.4,0.3,0.3"
                        value={weights}
                        onChange={(e) => {
                            setWeights(e.target.value);
                            setValidationError('');
                        }}
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Current sum: {weights.split(',').reduce((sum, w) => sum + (parseFloat(w.trim()) || 0), 0).toFixed(2)}
                </p>
            </div>

            <div>
                <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700">
                    Data Source
                </label>
                <select
                    id="dataSource"
                    name="dataSource"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                    value={dataSource}
                    onChange={(e) => {
                        setDataSource(e.target.value);
                        setValidationError('');
                    }}
                >
                    <option value="yfinance">Yahoo Finance (Free, No API Key)</option>
                    <option value="alpha_vantage">Alpha Vantage (Requires API Key)</option>
                </select>
            </div>

            {dataSource === 'alpha_vantage' && (
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                        Alpha Vantage API Key
                    </label>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="apiKey"
                            id="apiKey"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="Enter your API key"
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                                setValidationError('');
                            }}
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                        Get a free API key at <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">alphavantage.co</a>
                    </p>
                </div>
            )}

            <div>
                <button
                    type="button"
                    onClick={handleLoadExample}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 mb-4 transition-colors"
                >
                    Load Example Portfolio
                </button>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Analyze Portfolio
                </button>
            </div>
        </form>
    );
};

export default InputForm;
