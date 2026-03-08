import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CheckIcon from '../assets/check-icon.svg';
import CrossIcon from '../assets/cross-icon.svg';
import CloseIcon from '../assets/close-icon.svg';

type NotificationType = 'success' | 'error';

interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
}

/**
 * Hook that manages notification state locally.
 * Returns { showNotification }
 *  - showNotification(message, type) to trigger the popup
 *  - The notification renders via a portal at document.body — no JSX placement needed.
 */
export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'success',
  });

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ open: true, message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const NotificationComponent = (
    <Notification
      open={notification.open}
      message={notification.message}
      type={notification.type}
      onClose={closeNotification}
    />
  );

  return { showNotification, NotificationComponent };
}

interface NotificationProps {
  message: string;
  type: NotificationType;
  open: boolean;
  onClose: () => void;
  /** Auto-dismiss duration in ms (default 3500). Set 0 to disable. */
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ message, type, open, onClose, duration = 5000 }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      // Trigger enter animation
      requestAnimationFrame(() => setVisible(true));

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }, duration);
      }
    } else {
      setVisible(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, duration, onClose]);

  if (!open) return null;

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const isSuccess = type === 'success';

  return createPortal(
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
      <div
        role="alert"
        className={`flex items-center gap-2 py-4 px-6 min-w-[300px] max-w-[480px] bg-[var(--color-secondary)] rounded-lg shadow-2xl pointer-events-auto transition-all duration-300 ease-in-out border-l-4 ${
          isSuccess ? 'border-[var(--color-success)]' : 'border-[var(--color-error)]'
        } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {/* Icon */}
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
            isSuccess ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'
          }`}
        >
          <img
            src={isSuccess ? CheckIcon : CrossIcon}
            alt={isSuccess ? 'Success' : 'Error'}
            width="16"
            height="16"
          />
        </span>

        {/* Message */}
        <span className="flex-1 text-sm leading-normal text-[var(--color-text-light)] break-words">
          {message}
        </span>

        {/* Close button */}
        <span
          onClick={handleClose}
          role="button"
          className="cursor-pointer flex items-center justify-center shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-200"
          aria-label="Close notification"
        >
          <img src={CloseIcon} alt="Close" width="14" height="14" />
        </span>
      </div>
    </div>,
    document.body
  );
};

export default Notification;