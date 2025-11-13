import React from 'react';

const SummaryBox = ({ summary }) => {
    return (
        <div>
            <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Portfolio Analysis</h3>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-gray-800 leading-relaxed">
                    {summary}
                </p>
            </div>
        </div>
    );
};

export default SummaryBox;
