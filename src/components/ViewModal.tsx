import React from 'react';
import Button from './Button';
import { useNotification } from './Notification';

interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: Array<{
    label: string;
    value: string | React.ReactNode;
    isBadge?: boolean;
    badgeClass?: string;
    isScript?: boolean;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    color?: string;
  }>;
}

const ViewModal: React.FC<ViewModalProps> = ({ open, onClose, title, fields, actions }) => {
  const { showNotification, NotificationComponent } = useNotification();
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pt-20">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-5">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="border-b border-[var(--color-border)] last:border-b-0 pb-4 last:pb-0">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                  {field.label}
                </label>
                {field.isBadge && field.badgeClass ? (
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${field.badgeClass}`}>
                      {field.value}
                    </span>
                  </div>
                ) : field.isScript ? (
                  <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                    <div className="bg-gray-950 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">embed-script.js</span>
                      <button
                        onClick={() => {
                          if (typeof field.value === 'string') {
                            navigator.clipboard.writeText(field.value);
                            showNotification('Script copied to clipboard!', 'success');
                          }
                        }}
                        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                        className="p-2 rounded-lg hover:opacity-90 transition-opacity"
                        title="Copy to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="px-4 py-3 overflow-x-auto max-h-48 overflow-y-auto">
                      <pre className="font-mono text-xs leading-relaxed text-gray-100 whitespace-pre-wrap break-all">
                        {field.value}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p className="text-text-primary font-medium text-sm break-all leading-relaxed bg-bg-light px-3 py-2 rounded-lg">
                    {field.value || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[var(--color-border)] px-6 py-3 flex gap-3 bg-bg-light flex-shrink-0">
          {actions && actions.length > 0 ? (
            <>
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  style={action.color ? { backgroundColor: action.color } : undefined}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    action.color 
                      ? 'text-white hover:opacity-90' 
                      : 'border border-[var(--color-border)] text-text-primary hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </button>
              ))}
              <Button
                onClick={onClose}
                label="Close"
                color="secondary"
                variant="outline"
                fullWidth={false}
              />
            </>
          ) : (
            <Button
              onClick={onClose}
              label="Close"
              color="secondary"
              variant="outline"
              fullWidth={true}
            />
          )}
        </div>
      </div>
      {NotificationComponent}
    </div>
  );
};

export default ViewModal;
