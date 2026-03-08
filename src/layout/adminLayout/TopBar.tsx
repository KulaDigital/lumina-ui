// components/TopHeader.tsx
import React from 'react';
import Icon from '../../components/Icon';
import type { TopHeaderProps } from '../../types';

const TopHeader: React.FC<TopHeaderProps> = ({ currentPage = 'Dashboard' }) => {
  return (
    <div className="px-8 py-4 bg-white flex items-center justify-between sticky top-0 z-[100] border-b border-[var(--color-border)]">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Icon name="home" size="sm" decorative className="opacity-50" />
        <span className="text-[var(--color-text-secondary)]">Home</span>
        <span className="text-[var(--color-text-secondary)] opacity-40">/</span>
        <span className="text-[var(--color-text-primary)] font-medium">{currentPage}</span>
      </div>

      {/* Right: Search & Notifications */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
            <Icon name="search" size="sm" decorative />
          </div>
          <input
            type="text"
            placeholder="Search clients, chatbots..."
            className="w-[280px] pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-2 hover:bg-[var(--color-bg-light)] rounded-lg transition-colors">
          <Icon name="bell" size="sm" decorative className="opacity-60" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-error)] rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
