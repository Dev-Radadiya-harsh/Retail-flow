import React from 'react';

const KPICard = ({ title, value, trend, icon, isPositive = true, prefix = '', suffix = '' }) => {
  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="label mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {trend && (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isPositive 
                  ? 'bg-success-50 text-success-700' 
                  : 'bg-danger-50 text-danger-700'
              }`}>
                <span className="mr-1">{isPositive ? '↑' : '↓'}</span>
                {trend}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4">
            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 text-2xl">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
