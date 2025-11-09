import React from 'react';

const SummaryBox = ({ summary }) => {
    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">AI-Generated Summary</h3>
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                    {summary}
                </p>
            </div>
        </div>
    );
};

export default SummaryBox;
