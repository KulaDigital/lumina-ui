// components/StatCard.tsx
import React from 'react';
import Icon from './Icon';
import type { StatCardProps } from '../types';

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  change, 
  changeType = 'positive',
  iconColor = 'blue' 
}) => {
  const iconColors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-500',
    purple: 'bg-purple-50 text-purple-500',
    green: 'bg-green-50 text-green-500',
    orange: 'bg-orange-50 text-orange-500',
    red: 'bg-red-50 text-red-500',
  };

  const changeColors: Record<string, string> = {
    positive: 'text-status-success',
    negative: 'text-status-error',
  };

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-md ${iconColors[iconColor]} flex items-center justify-center`}>
          <Icon name={icon} size="md" decorative />
        </div>
      </div>

      {/* Label */}
      <div className="text-sm text-text-secondary font-medium mb-2 font-body">
        {label}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-text-primary mb-2 font-heading">
        {value}
      </div>

      {/* Change */}
      {change && (
        <div className={`text-sm font-medium ${changeColors[changeType]}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;