import React from 'react';

interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  decorative?: boolean;
  ariaLabel?: string;
  title?: string;
}

// Mapping of emoji/names to SVG paths and metadata
const iconMap: Record<
  string,
  {
    viewBox: string;
    path: string;
    defaultColor?: string;
  }
> = {
  // Navigation & Overview
  dashboard: {
    viewBox: '0 0 24 24',
    path: 'M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2zm4 8h2v8h-2z',
    defaultColor: 'currentColor',
  },
  // 📊 Statistics/Analytics
  analytics: {
    viewBox: '0 0 24 24',
    path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  stats: {
    viewBox: '0 0 24 24',
    path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  // 📈 Growth/Trending
  trending: {
    viewBox: '0 0 24 24',
    path: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  // 🤖 Chatbots
  chatbot: {
    viewBox: '0 0 24 24',
    path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  robot: {
    viewBox: '0 0 24 24',
    path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  // 💰 Billing/Money
  billing: {
    viewBox: '0 0 24 24',
    path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  money: {
    viewBox: '0 0 24 24',
    path: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  // 👥 Users/Clients
  users: {
    viewBox: '0 0 24 24',
    path: 'M12 4.354a4 4 0 110 8 4 4 0 010-8M3 20.394c0-3.314 4.03-6 9-6s9 2.686 9 6',
  },
  people: {
    viewBox: '0 0 24 24',
    path: 'M12 4.354a4 4 0 110 8 4 4 0 010-8M3 20.394c0-3.314 4.03-6 9-6s9 2.686 9 6',
  },
  // 💳 Subscription/Payment
  subscription: {
    viewBox: '0 0 24 24',
    path: 'M3 10h18M7 15h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  card: {
    viewBox: '0 0 24 24',
    path: 'M3 10h18M7 15h10M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  // 💬 Chat/Conversations/Feedback
  chat: {
    viewBox: '0 0 24 24',
    path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  message: {
    viewBox: '0 0 24 24',
    path: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V4a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  feedback: {
    viewBox: '0 0 24 24',
    path: '7 8h10M7 12h4m1 8l-4-2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2l-4 2v-2z',
  },
  // 📝 Logs/Activity
  logs: {
    viewBox: '0 0 24 24',
    path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  activity: {
    viewBox: '0 0 24 24',
    path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  // ⚙️ Settings/Configuration
  settings: {
    viewBox: '0 0 24 24',
    path: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  cog: {
    viewBox: '0 0 24 24',
    path: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  // 🔒 Security/Lock
  security: {
    viewBox: '0 0 24 24',
    path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  lock: {
    viewBox: '0 0 24 24',
    path: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  // 🎫 Tickets/Support
  tickets: {
    viewBox: '0 0 24 24',
    path: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z',
  },
  support: {
    viewBox: '0 0 24 24',
    path: '15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z',
  },
  // 🔗 Integrations/Link
  integrations: {
    viewBox: '0 0 24 24',
    path: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  },
  link: {
    viewBox: '0 0 24 24',
    path: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  // 🔑 API Keys/Keys
  keys: {
    viewBox: '0 0 24 24',
    path: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  },
  api: {
    viewBox: '0 0 24 24',
    path: '(M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  },
  storage: {
    viewBox: '0 0 24 24',
    path: 'M20 13H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2zM4 9h16M12 6V3m-3 0h6',
  },
  // Additional utility icons
  check: {
    viewBox: '0 0 24 24',
    path: 'M5 13l4 4L19 7',
  },
  close: {
    viewBox: '0 0 24 24',
    path: 'M6 18L18 6M6 6l12 12',
  },
  menu: {
    viewBox: '0 0 24 24',
    path: 'M4 6h16M4 12h16M4 18h16',
  },
  search: {
    viewBox: '0 0 24 24',
    path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  chevronDown: {
    viewBox: '0 0 24 24',
    path: 'M19 14l-7 7m0 0l-7-7m7 7V3',
  },
  chevronRight: {
    viewBox: '0 0 24 24',
    path: 'M9 5l7 7-7 7',
  },
  arrowRight: {
    viewBox: '0 0 24 24',
    path: 'M13 7l5 5m0 0l-5 5m5-5H6',
  },
  plus: {
    viewBox: '0 0 24 24',
    path: 'M12 5v14m-7-7h14',
  },
  trash: {
    viewBox: '0 0 24 24',
    path: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  },
  edit: {
    viewBox: '0 0 24 24',
    path: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  },
  download: {
    viewBox: '0 0 24 24',
    path: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  },
  copy: {
    viewBox: '0 0 24 24',
    path: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
};

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-24 h-24',
};

/**
 * Reusable Icon Component
 * 
 * @param name - Icon name/key (e.g., 'analytics', 'chatbot', 'settings')
 * @param size - Icon size (xs, sm, md, lg, xl, 2xl) - default: md
 * @param className - Additional CSS classes to apply
 * @param decorative - If true, sets aria-hidden="true" for decorative icons
 * @param ariaLabel - Aria label for accessible icons (when not decorative)
 * @param title - Title attribute for tooltip
 * 
 * @example
 * // Decorative icon
 * <Icon name="analytics" size="lg" decorative />
 * 
 * // Accessible icon
 * <Icon name="settings" ariaLabel="Settings" title="Open Settings" />
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  decorative = true,
  ariaLabel,
  title,
}) => {
  const icon = iconMap[name.toLowerCase()];

  if (!icon) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  const sizeClass = sizeMap[size];
  const accessibilityProps = decorative
    ? { 'aria-hidden': 'true' as const }
    : { 'aria-label': ariaLabel || name };

  return (
    <svg
      className={`${sizeClass} ${className}`}
      viewBox={icon.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...accessibilityProps}
      {...(title && { title })}
    >
      <path d={icon.path} />
    </svg>
  );
};

export default Icon;
