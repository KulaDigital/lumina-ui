// components/TopHeader.tsx
import React from 'react';
import type { TopHeaderProps } from '../../types';

const TopHeader: React.FC<TopHeaderProps> = ({ currentPage = 'Dashboard' }) => {
  return (
    <div className="px-10 py-5 bg-white flex items-center justify-between sticky top-0 z-[100]">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">🏠 Home</span>
          <span className="text-text-secondary">›</span>
          <span className="text-text-primary font-medium">{currentPage}</span>
        </div>
      </div>

      {/* Right: Search & Notifications */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search clients, chatbots..."
            className="w-[320px] pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-md text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-2 hover:bg-bg-light rounded-md transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;