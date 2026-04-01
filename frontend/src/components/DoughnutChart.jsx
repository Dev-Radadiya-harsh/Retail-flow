import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data, labels }) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: [
          '#2563eb',
          '#3b82f6',
          '#60a5fa',
          '#93c5fd',
          '#bfdbfe',
          '#dbeafe',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 16,
          font: {
            size: 13,
            weight: '500',
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        padding: 14,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 15,
          weight: '500',
        },
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return label + ': ₹' + value.toLocaleString();
          }
        }
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default DoughnutChart;
