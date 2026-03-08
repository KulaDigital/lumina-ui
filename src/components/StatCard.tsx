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
    positive: 'text-[var(--color-success)]',
    negative: 'text-[var(--color-error)]',
  };

  // Check if icon is an emoji (not in our icon map)
  const isEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}✓✅❌○●⚡📚📋]/u.test(icon);

  return (
    <div className="card p-6">
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-lg ${iconColors[iconColor]} flex items-center justify-center`}>
          {isEmoji ? (
            <span className="text-lg">{icon}</span>
          ) : (
            <Icon name={icon} size="md" decorative />
          )}
        </div>
      </div>

      {/* Label */}
      <div className="text-sm text-[var(--color-text-secondary)] font-medium mb-1" style={{ fontFamily: 'var(--font-body)' }}>
        {label}
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
        {value}
      </div>

      {/* Change */}
      {change && (
        <div className={`text-xs font-medium ${changeColors[changeType]}`}>
          {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;
