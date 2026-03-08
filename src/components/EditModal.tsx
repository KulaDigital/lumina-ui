import React from 'react';
import Button from './Button';

interface EditField {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'select' | 'color' | 'custom';
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  renderCustom?: () => React.ReactNode;
}

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  fields: EditField[];
  loading?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ open, onClose, onSave, title, fields, loading = false }) => {
  if (!open) return null;

  const formatOptionLabel = (option: string): string => {
    return option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pt-20">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-5">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                  {field.label}
                </label>
                {field.type === 'custom' && field.renderCustom ? (
                  field.renderCustom()
                ) : field.type === 'select' ? (
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-text-primary font-medium bg-white hover:border-[var(--color-border)] transition-colors"
                  >
                    <option value="">Select {field.label}...</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {formatOptionLabel(option)}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-[var(--color-border)]">
                    <div className="flex-shrink-0">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-14 h-14 cursor-pointer shadow-sm hover:shadow-md transition-shadow border-0 p-0.5 rounded-lg"
                      />
                    </div>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="#000000"
                      className="flex-1 border border-[var(--color-border)] rounded-md px-3 py-2 text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-text-primary font-medium bg-white hover:border-[var(--color-border)] transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[var(--color-border)] px-6 py-3 flex gap-3 bg-bg-light flex-shrink-0">
          <Button
            onClick={onClose}
            label="Cancel"
            color="secondary"
            variant="outline"
            disabled={loading}
            fullWidth={true}
          />
          <Button
            onClick={onSave}
            label={loading ? 'Saving...' : 'Save'}
            color="primary"
            variant="solid"
            disabled={loading}
            fullWidth={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EditModal;
