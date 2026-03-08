import React from 'react';

// Import all icon SVGs from assets/icons/
import dashboardIcon from '../assets/icons/dashboard.svg';
import analyticsIcon from '../assets/icons/analytics.svg';
import trendingIcon from '../assets/icons/trending.svg';
import chatbotIcon from '../assets/icons/chatbot.svg';
import billingIcon from '../assets/icons/billing.svg';
import usersIcon from '../assets/icons/users.svg';
import subscriptionIcon from '../assets/icons/subscription.svg';
import chatIcon from '../assets/icons/chat.svg';
import feedbackIcon from '../assets/icons/feedback.svg';
import logsIcon from '../assets/icons/logs.svg';
import settingsIcon from '../assets/icons/settings.svg';
import securityIcon from '../assets/icons/security.svg';
import ticketsIcon from '../assets/icons/tickets.svg';
import integrationsIcon from '../assets/icons/integrations.svg';
import keysIcon from '../assets/icons/keys.svg';
import searchIcon from '../assets/icons/search.svg';
import checkIcon from '../assets/icons/check.svg';
import closeIcon from '../assets/icons/close.svg';
import plusIcon from '../assets/icons/plus.svg';
import trashIcon from '../assets/icons/trash.svg';
import editIcon from '../assets/icons/edit.svg';
import menuIcon from '../assets/icons/menu.svg';
import downloadIcon from '../assets/icons/download.svg';
import copyIcon from '../assets/icons/copy.svg';
import storageIcon from '../assets/icons/storage.svg';
import linkIcon from '../assets/icons/link.svg';
import chevronDownIcon from '../assets/icons/chevron-down.svg';
import chevronRightIcon from '../assets/icons/chevron-right.svg';
import arrowRightIcon from '../assets/icons/arrow-right.svg';
import bookIcon from '../assets/icons/book.svg';
import infoIcon from '../assets/icons/info.svg';
import bellIcon from '../assets/icons/bell.svg';
import homeIcon from '../assets/icons/home.svg';

interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  decorative?: boolean;
  ariaLabel?: string;
  title?: string;
}

// Map icon names to imported SVG files
const iconMap: Record<string, string> = {
  dashboard: dashboardIcon,
  analytics: analyticsIcon,
  stats: analyticsIcon,
  trending: trendingIcon,
  chatbot: chatbotIcon,
  robot: chatbotIcon,
  billing: billingIcon,
  money: billingIcon,
  users: usersIcon,
  people: usersIcon,
  subscription: subscriptionIcon,
  card: subscriptionIcon,
  chat: chatIcon,
  message: chatIcon,
  feedback: feedbackIcon,
  logs: logsIcon,
  activity: logsIcon,
  settings: settingsIcon,
  cog: settingsIcon,
  security: securityIcon,
  lock: securityIcon,
  tickets: ticketsIcon,
  support: ticketsIcon,
  integrations: integrationsIcon,
  link: linkIcon,
  keys: keysIcon,
  api: keysIcon,
  storage: storageIcon,
  search: searchIcon,
  check: checkIcon,
  close: closeIcon,
  menu: menuIcon,
  plus: plusIcon,
  trash: trashIcon,
  edit: editIcon,
  download: downloadIcon,
  copy: copyIcon,
  chevronDown: chevronDownIcon,
  chevronRight: chevronRightIcon,
  arrowRight: arrowRightIcon,
  book: bookIcon,
  info: infoIcon,
  bell: bellIcon,
  home: homeIcon,
};

const sizeMap: Record<string, { width: number; height: number }> = {
  xs: { width: 12, height: 12 },
  sm: { width: 16, height: 16 },
  md: { width: 24, height: 24 },
  lg: { width: 32, height: 32 },
  xl: { width: 48, height: 48 },
  '2xl': { width: 96, height: 96 },
};

/**
 * Reusable Icon Component
 * Uses standalone SVG files from /assets/icons/
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  className = '',
  decorative = true,
  ariaLabel,
  title,
}) => {
  const iconSrc = iconMap[name.toLowerCase()];

  if (!iconSrc) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  const dimensions = sizeMap[size];

  return (
    <img
      src={iconSrc}
      alt={decorative ? '' : (ariaLabel || name)}
      title={title}
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      aria-hidden={decorative ? 'true' : undefined}
      style={{ display: 'inline-block' }}
    />
  );
};

export default Icon;
