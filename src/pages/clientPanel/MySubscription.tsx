import React, { useState, useEffect } from 'react';
import { clientApi } from '../../api';
import Icon from '../../components/Icon';
import Button from '../../components/Button';

interface SubscriptionData {
  plan: string;
  period: string;
  status: string;
  is_trial: boolean;
  started_at: string;
  ends_at: string;
}

interface ModalState {
  open: boolean;
  type: 'upgrade' | 'downgrade' | 'cancel';
}

const mockUsage = {
  conversations: { used: 450, limit: 1000 },
  storage: { used: 2.3, limit: 10, unit: 'GB' },
  apiCalls: { used: 15450, limit: 50000 },
};

const MySubscription: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false, type: 'upgrade' });
  const [requestEmail, setRequestEmail] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await clientApi.getClientProfile();
        setSubscription(data.subscription || null);
        setUserEmail(data.email || '');
        setRequestEmail(data.email || '');
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDaysRemaining = () => {
    if (!subscription?.ends_at) return 0;
    const diff = new Date(subscription.ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-[var(--color-success-light,#dcfce7)] text-[var(--color-success)]',
      expired: 'bg-[var(--color-error-light,#fef2f2)] text-[var(--color-error)]',
      canceled: 'bg-[var(--color-warning-light,#fefce8)] text-[var(--color-warning)]',
      trial: 'bg-blue-50 text-blue-600',
    };
    const key = status?.toLowerCase() || 'active';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[key] || styles.active}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const openModal = (type: 'upgrade' | 'downgrade' | 'cancel') => {
    setModal({ open: true, type });
    setRequestEmail(userEmail);
    setRequestDetails('');
  };

  const handleSubmitRequest = () => {
    const typeLabel = modal.type === 'cancel' ? 'Cancellation' : modal.type === 'upgrade' ? 'Upgrade' : 'Downgrade';
    console.log(`[${typeLabel} Request]`, { email: requestEmail, details: requestDetails });
    setToastMessage(`Request submitted! We'll contact you at ${requestEmail}`);
    setModal({ open: false, type: 'upgrade' });
    setTimeout(() => setToastMessage(''), 4000);
  };

  const modalTitle: Record<string, string> = {
    upgrade: 'Request Upgrade',
    downgrade: 'Request Downgrade',
    cancel: 'Request Cancellation',
  };

  const ProgressBar = ({ label, used, limit, unit }: { label: string; used: number; limit: number; unit?: string }) => {
    const pct = Math.round((used / limit) * 100);
    return (
      <div className="mb-5 last:mb-0">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-[var(--color-text-primary)]">{label}</span>
          <span className="text-[var(--color-text-secondary)]">
            {used.toLocaleString()}{unit ? ` ${unit}` : ''} / {limit.toLocaleString()}{unit ? ` ${unit}` : ''} ({pct}%)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[var(--color-border,#e5e7eb)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              backgroundColor: pct > 80 ? 'var(--color-warning)' : 'var(--color-primary)',
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--color-text-secondary)]">Loading subscription...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        My Subscription
      </h1>

      {/* A. Current Plan Card */}
      <div className="card p-8 mb-6 text-center" style={{ background: 'linear-gradient(135deg, var(--color-primary-light, #eff6ff) 0%, white 100%)' }}>
        <p className="text-sm text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider font-medium">Current Plan</p>
        <h2 className="text-4xl font-bold text-[var(--color-primary)] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'No Plan'}
        </h2>
        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)] text-white">
            {subscription?.period ? subscription.period.charAt(0).toUpperCase() + subscription.period.slice(1) : 'N/A'}
          </span>
          {subscription?.status && getStatusBadge(subscription.status)}
          {subscription?.is_trial && getStatusBadge('trial')}
        </div>
        {subscription?.is_trial && (
          <p className="text-sm font-medium text-[var(--color-warning)] mb-3">
            ⏳ Trial ends in {getDaysRemaining()} days
          </p>
        )}
        <div className="flex justify-center gap-8 text-sm text-[var(--color-text-secondary)] flex-wrap">
          {subscription?.started_at && (
            <div>
              <span className="font-medium">Started:</span> {formatDate(subscription.started_at)}
            </div>
          )}
          {subscription?.ends_at && (
            <div>
              <span className="font-medium">{subscription.is_trial ? 'Expires:' : 'Next Renewal:'}</span> {formatDate(subscription.ends_at)}
            </div>
          )}
        </div>
      </div>

      {/* B. Usage Metrics */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
          Usage Overview
        </h3>
        <ProgressBar label="Conversations" used={mockUsage.conversations.used} limit={mockUsage.conversations.limit} />
        <ProgressBar label="Storage" used={mockUsage.storage.used} limit={mockUsage.storage.limit} unit={mockUsage.storage.unit} />
        <ProgressBar label="API Calls" used={mockUsage.apiCalls.used} limit={mockUsage.apiCalls.limit} />
        <p className="text-xs text-[var(--color-text-secondary)] mt-4 italic">* Usage tracking coming soon</p>
      </div>

      {/* C. Action Buttons */}
      <div className="card p-6 mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          Manage Subscription
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button label="Upgrade Plan" onClick={() => openModal('upgrade')} color="primary" variant="solid" />
          <Button label="Downgrade Plan" onClick={() => openModal('downgrade')} color="secondary" variant="outline" />
          <button
            onClick={() => openModal('cancel')}
            className="px-4 py-2 rounded font-medium text-sm transition-colors bg-[var(--color-error-light,#fef2f2)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* D. Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal({ ...modal, open: false })}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {modalTitle[modal.type]}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">
              Our payments team will contact you within 24 hours.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Email</label>
              <input
                type="email"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Additional details (optional)</label>
              <textarea
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                rows={3}
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button label="Cancel" onClick={() => setModal({ ...modal, open: false })} color="secondary" variant="outline" />
              <Button label="Submit Request" onClick={handleSubmitRequest} color="primary" variant="solid" />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--color-success)] text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
};

export default MySubscription;
