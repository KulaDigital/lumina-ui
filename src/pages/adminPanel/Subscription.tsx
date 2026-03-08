import React, { useEffect, useState } from 'react';
import type { Subscription, SubscriptionStatus, SubscriptionObject, SubscriptionPlan } from '../../types';
import {
  getAllClientsWithSubscriptions,
  updateSubscriptionStatus,
  updateSubscriptionPlan,
  formatSubscriptionDate,
  daysUntilExpiry,
  getStatusBadgeClasses,
} from '../../utils/subscriptionApi';
import Button from '../../components/Button';

interface ClientSubscriptionData extends Subscription {
  company_name: string;
}

interface ManageModalState {
  isOpen: boolean;
  clientId: number | null;
  clientName: string | null;
  currentSubscription: SubscriptionObject | null;
}

/**
 * Admin Subscription Management Page
 * 
 * IMPORTANT: This page is for ADMIN USERS ONLY
 * - Admins manage CLIENT subscriptions
 * - Admins themselves never have subscriptions (role='super_admin')
 * - Only display subscriptions of clients (role='client')
 * 
 * Valid subscription statuses (3 values):
 * - 'active': Currently active and user can access (ends_at > now)
 * - 'expired': Period ended naturally or manually marked as expired
 * - 'canceled': Client canceled their subscription
 * 
 * Note: 'inactive' is NOT a valid subscription status
 * Client inactive status is managed separately in clients table
 */
const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<ClientSubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  
  // Manage modal state
  const [manageModal, setManageModal] = useState<ManageModalState>({
    isOpen: false,
    clientId: null,
    clientName: null,
    currentSubscription: null,
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<SubscriptionStatus | ''>('');
  const [selectedNewPlan, setSelectedNewPlan] = useState<SubscriptionPlan | ''>('');

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the new optimized endpoint that returns clients + subscriptions in one call
      const data = await getAllClientsWithSubscriptions(statusFilter);
      
      const formattedData: ClientSubscriptionData[] = data
        .filter((item: any) => item.subscription !== null) // Only show clients with subscriptions
        .map((item: any) => ({
          client_id: item.id,
          client: item.company_name,
          company_name: item.company_name,
          subscription: item.subscription,
          has_subscription: item.has_subscription,
        }));
      
      setSubscriptions(formattedData);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const openManageModal = (sub: ClientSubscriptionData) => {
    setManageModal({
      isOpen: true,
      clientId: sub.client_id,
      clientName: sub.client,
      currentSubscription: sub.subscription,
    });
    setSelectedNewStatus(sub.subscription?.status || '');
    setSelectedNewPlan(sub.subscription?.plan || '');
    setUpdateError(null);
  };

  const closeManageModal = () => {
    setManageModal({
      isOpen: false,
      clientId: null,
      clientName: null,
      currentSubscription: null,
    });
    setSelectedNewStatus('');
    setSelectedNewPlan('');
    setUpdateError(null);
  };

  const handleStatusUpdate = async () => {
    if (!manageModal.clientId) {
      setUpdateError('Client ID is missing');
      return;
    }

    const hasStatusChanged = selectedNewStatus && selectedNewStatus !== manageModal.currentSubscription?.status;
    const hasPlanChanged = selectedNewPlan && selectedNewPlan !== manageModal.currentSubscription?.plan;

    if (!hasStatusChanged && !hasPlanChanged) {
      setUpdateError('Please make a change to status or plan');
      return;
    }

    try {
      setUpdatingStatus(true);
      setUpdateError(null);
      
      let updatedSubscription = manageModal.currentSubscription;

      // Update status if changed
      if (hasStatusChanged) {
        updatedSubscription = await updateSubscriptionStatus(
          manageModal.clientId,
          selectedNewStatus as SubscriptionStatus
        );
      }

      // Update plan if changed
      if (hasPlanChanged) {
        updatedSubscription = await updateSubscriptionPlan(
          manageModal.clientId,
          selectedNewPlan as SubscriptionPlan
        );
      }
      
      // Update local state with the final subscription
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.client_id === manageModal.clientId
            ? { ...sub, subscription: updatedSubscription }
            : sub
        )
      );
      
      closeManageModal();
    } catch (err) {
      console.error('Error updating subscription:', err);
      setUpdateError('Failed to update subscription. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (subscription: SubscriptionObject | null): string => {
    return getStatusBadgeClasses(subscription?.status || null);
  };

  const getStatusDisplayText = (status: SubscriptionStatus): string => {
    const statusMap: Record<SubscriptionStatus, string> = {
      active: 'Active',
      expired: 'Expired',
      canceled: 'Canceled',
    };
    return statusMap[status];
  };

  return (
    <div className="bg-bg-light min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1>
          Subscription Plans
        </h1>
        <p className="text-text-secondary font-body">
          Manage client subscriptions and status
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            statusFilter === 'active'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-white text-text-secondary border border-[var(--color-border)] hover:bg-bg-light'
          }`}
        >
          Active Clients
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            statusFilter === 'inactive'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-white text-text-secondary border border-[var(--color-border)] hover:bg-bg-light'
          }`}
        >
          Inactive Clients
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-8 text-center">
          <p className="text-text-secondary">Loading subscriptions...</p>
        </div>
      )}

      {/* Subscriptions Table Card */}
      {!loading && (
        <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h3 className="text-xl font-bold text-text-primary font-heading">
              Client Subscriptions ({subscriptions.length})
            </h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-text-secondary">
                  {statusFilter === 'active'
                    ? 'No active clients with subscriptions found'
                    : 'No inactive clients with subscriptions found'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-light border-b border-[var(--color-border)]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Expires On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {subscriptions.map((sub) => (
                    <tr key={sub.client_id} className="hover:bg-bg-light transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-text-primary">{sub.client}</span>
                          {sub.subscription?.is_trial && (
                            <span className="inline-flex items-center w-fit px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              🎉 Trial Period
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-medium text-text-primary">
                            {sub.subscription?.plan}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-text-secondary">
                          {sub.subscription?.period}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            sub.subscription
                          )}`}
                        >
                          {sub.subscription && getStatusDisplayText(sub.subscription.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium text-text-primary">
                            {formatSubscriptionDate(sub.subscription!.ends_at)}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {sub.subscription!.status === 'active'
                              ? `${daysUntilExpiry(sub.subscription!.ends_at)} days left`
                              : sub.subscription!.status === 'expired'
                              ? 'Expired'
                              : 'Canceled'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => openManageModal(sub)}
                          label="Manage"
                          color="primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Manage Subscription Modal */}
      {manageModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-white">Manage Subscription</h2>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Client Info */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Client Name
                </label>
                <div className="px-4 py-2.5 bg-bg-light rounded-lg border border-[var(--color-border)]">
                  <p className="font-medium text-text-primary">{manageModal.clientName}</p>
                </div>
              </div>

              {/* Current Subscription Details */}
              {manageModal.currentSubscription && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-text-secondary">Plan:</span>
                    <span className="text-sm font-semibold text-text-primary capitalize">
                      {manageModal.currentSubscription.plan}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-text-secondary">Period:</span>
                    <span className="text-sm font-semibold text-text-primary capitalize">
                      {manageModal.currentSubscription.period}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-text-secondary">Expires:</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {formatSubscriptionDate(manageModal.currentSubscription.ends_at)}
                    </span>
                  </div>
                  {manageModal.currentSubscription.is_trial && (
                    <div className="flex justify-between items-start pt-2 border-t border-blue-200">
                      <span className="text-sm font-medium text-text-secondary">Type:</span>
                      <span className="text-sm font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                        🎉 Trial Period
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Alert */}
              {updateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{updateError}</p>
                </div>
              )}

              {/* Status Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Change Status
                </label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value as SubscriptionStatus | '')}
                  className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-text-primary font-medium bg-white hover:border-[var(--color-border)] transition-colors"
                >
                  <option value="">-- Select Status --</option>
                  <option value="active">Active</option>
                  <option value="canceled">Canceled</option>
                </select>
                <p className="text-xs text-text-secondary">
                  💡 <strong>Note:</strong> Subscriptions automatically expire via scheduled Supabase cron job
                </p>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Change Plan
                </label>
                {manageModal.currentSubscription?.is_trial ? (
                  <div className="w-full px-4 py-2.5 border border-amber-200 rounded-lg bg-amber-50 flex items-center gap-2">
                    <span className="text-amber-700 text-sm">🔒</span>
                    <div>
                      <p className="text-sm font-medium text-amber-700">Trial plans are locked</p>
                      <p className="text-xs text-amber-600">Trial subscriptions must remain on the Professional plan</p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedNewPlan}
                    onChange={(e) => setSelectedNewPlan(e.target.value as SubscriptionPlan | '')}
                    className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-text-primary font-medium bg-white hover:border-[var(--color-border)] transition-colors"
                  >
                    <option value="">-- Select Plan --</option>
                    <option value="professional">Professional</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                )}
              </div>

              {/* Status Descriptions */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs text-text-secondary">
                <p>
                  <strong>Active:</strong> Subscription is valid & user can access features
                </p>
                <p>
                  <strong>Canceled:</strong> User canceled, user loses access
                </p>
                <p>
                  <strong>Expired:</strong> Automatically set by Supabase cron job when end_date passes
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[var(--color-border)] px-6 py-3 flex gap-3 bg-bg-light flex-shrink-0">
              <Button
                onClick={closeManageModal}
                label="Cancel"
                color="secondary"
                variant="outline"
                disabled={updatingStatus}
                fullWidth={true}
              />
              <Button
                onClick={handleStatusUpdate}
                label={updatingStatus ? 'Updating...' : 'Update'}
                color="primary"
                variant="solid"
                disabled={updatingStatus || !selectedNewStatus}
                fullWidth={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;