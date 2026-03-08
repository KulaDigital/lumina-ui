import React from 'react';
import Icon from '../components/Icon';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: string; // Icon name to render via Icon component
}

const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = "We're working hard to bring this feature to you soon!",
  icon = "analytics"
}) => {
  return (
    <div className="flex flex-col gap-5 pb-20 h-full">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-text-primary font-heading text-2xl">
          {title}
        </h1>
        <p className="text-text-secondary font-body text-sm mt-1">
          {description}
        </p>
      </div>

      {/* COMING SOON CONTENT */}
      <div className="flex items-center justify-center flex-1 w-full">
        <div className="text-center space-y-8 max-w-2xl w-full px-4">
          {/* Icon */}
          <div className="flex justify-center animate-bounce text-blue-500">
            <Icon name={icon} size="2xl" decorative />
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-text-primary">
              Coming Soon
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>

          {/* Features Under Development */}
          <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
            <p className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
              What we're building:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
                Enhanced Features
              </span>
              <span className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200">
                Better Analytics
              </span>
              <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                Performance
              </span>
              <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-medium border border-orange-200">
                New Tools
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ENCOURAGEMENT */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl text-center">
        <p className="text-sm text-text-secondary">
          In the meantime, explore other features or contact our team for more information.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
