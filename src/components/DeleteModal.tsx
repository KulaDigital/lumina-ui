import React from 'react';
import Button from './Button';

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  loading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ open, onClose, onConfirm, title, itemName, loading = false }) => {
  if (!open) return null;

  const [isHovered, setIsHovered] = React.useState(false);

  const getDeactivateButtonStyle = (): React.CSSProperties => ({
    backgroundColor: isHovered ? 'var(--color-warning)' : 'var(--color-warning)',
    color: 'white',
    opacity: loading ? 0.5 : isHovered ? 0.9 : 1,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pt-20">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-4 flex-shrink-0">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1 p-5">
          <p className="text-text-secondary leading-relaxed">
            Are you sure you want to deactivate <span className="font-semibold text-text-primary">{itemName}</span>? This record will be archived and can be viewed later.
          </p>
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
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded font-medium transition-colors duration-200 w-full text-white ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={getDeactivateButtonStyle()}
            onMouseEnter={() => !loading && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {loading ? 'Deactivating...' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

