import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface TopBarProps {
  panelLabel: string;
  basePath: string;
  navItems: NavItem[];
}

// Extract page label from path using nav items
function getPageLabel(pathname: string, navItems: NavItem[]): string {
  const match = navItems.find((item) => pathname === item.path || pathname.startsWith(item.path + '/'));
  return match?.label || 'Dashboard';
}

const TopBar: React.FC<TopBarProps> = ({ panelLabel, basePath, navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentPage = getPageLabel(location.pathname, navItems);

  // Filter nav items by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return navItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query, navItems]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (path: string) => {
    setQuery('');
    setShowResults(false);
    navigate(path);
  };

  return (
    <div className="px-8 py-4 bg-white flex items-center justify-between sticky top-0 z-[100] border-b border-[var(--color-border)]">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Icon name="home" size="sm" decorative className="opacity-50 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(basePath)} />
        <span
          className="text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors"
          onClick={() => navigate(basePath)}
        >
          {panelLabel}
        </span>
        <span className="text-[var(--color-text-secondary)] opacity-40">/</span>
        <span className="text-[var(--color-text-primary)] font-medium">{currentPage}</span>
      </div>

      {/* Right: Search & Notifications */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">
            <Icon name="search" size="sm" decorative />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => query.trim() && setShowResults(true)}
            placeholder="Search pages..."
            className="w-[240px] pl-9 pr-4 py-2 border border-[var(--color-border)] rounded-lg text-sm outline-none transition-all focus:border-[var(--color-primary)] focus:shadow-[0_0_0_3px_var(--color-primary-light)]"
          />

          {/* Search Results Dropdown */}
          {showResults && query.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden z-50">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <div
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--color-bg-light)] transition-colors text-sm"
                  >
                    <Icon name={item.icon} size="sm" decorative className="opacity-50" />
                    <span className="text-[var(--color-text-primary)] font-medium">{item.label}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">No pages found</div>
              )}
            </div>
          )}
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

export default TopBar;
