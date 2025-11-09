import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartArea = ({ tickers, weights }) => {
    const chartData = {
        labels: tickers,
        datasets: [
            {
                label: 'Portfolio Weights',
                data: weights.map(w => w * 100), // Convert to percentages
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 255, 0.6)',
                    'rgba(255, 99, 255, 0.6)',
                    'rgba(99, 255, 132, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(255, 99, 255, 1)',
                    'rgba(99, 255, 132, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value.toFixed(1)}%`;
                    }
                }
            },
            legend: {
                position: 'bottom',
            }
        }
    };

    return (
        <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Portfolio Allocation</h3>
            <div className="mt-4">
                <Pie data={chartData} options={options} />
            </div>
        </div>
    );
};

export default ChartArea;
