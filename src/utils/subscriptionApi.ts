import axiosInstance from './instance';
import type { SubscriptionObject, SubscriptionStatus, SubscriptionPlan } from '../types';

/**
 * IMPORTANT: Subscriptions are CLIENT ROLE ONLY
 * Super admin users (role='super_admin') never have subscriptions
 * Client users (role='client') can have subscriptions
 */

/**
 * Get subscription details for a specific client
 * Fetches the subscription object which includes status, plan, period, and is_entitled flag
 * Returns null if client doesn't have a subscription (common for newly created clients)
 */
export const getClientSubscription = async (clientId: number): Promise<SubscriptionObject | null> => {
  try {
    const response = await axiosInstance.get(`/admin/clients/${clientId}/subscription`);
    if (response.data.success && response.data.subscription) {
      return response.data.subscription;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching subscription for client ${clientId}:`, error);
    throw error;
  }
};

/**
 * Get all clients .with their subscription information
 * Uses the optimized endpoint: GET /api/admin/clients/with-subscriptions/:status
 * This returns all clients + subscriptions in a SINGLE API call (no N+1 problem)
 * 
 * IMPORTANT: Only client role users have subscriptions
 * Admin users will have subscription=null and has_subscription=false
 */
export const getAllClientsWithSubscriptions = async (
  status: 'active' | 'inactive' = 'active'
): Promise<
  Array<{
    id: number;
    company_name: string;
    subscription: SubscriptionObject | null;
    has_subscription: boolean;
  }>
> => {
  try {
    // Use the optimized endpoint that returns clients + subscriptions in one call
    const response = await axiosInstance.get(`/admin/clients/with-subscriptions/${status}`);
    
    if (response.data.success && response.data.clients) {
      // Map clients directly from response
      const formattedClients = response.data.clients.map((client: any) => ({
        id: client.id,
        company_name: client.company_name,
        // Subscription is already included in the response with is_entitled computed
        subscription: client.subscription || null,
        has_subscription: client.subscription ? true : false,
      }));
      
      return formattedClients;
    }
    return [];
  } catch (error) {
    console.error('Error fetching clients with subscriptions:', error);
    throw error;
  }
};

/**
 * Update subscription status for a client
 * 
 * Valid statuses (3 values):
 * - 'active': Subscription is currently active (ends_at > now())
 * - 'expired': Subscription period ended (set by scheduled job or manually)
 * - 'canceled': Client canceled subscription
 * 
 * Note: 'inactive' is NOT a valid subscription status
 * Client inactive status is managed separately in clients table
 */
export const updateSubscriptionStatus = async (
  clientId: number,
  status: SubscriptionStatus
): Promise<SubscriptionObject> => {
  // Validate status (only 3 valid values)
  const validStatuses: SubscriptionStatus[] = ['active', 'expired', 'canceled'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  try {
    const response = await axiosInstance.post(
      `/admin/clients/${clientId}/subscription/status`,
      { status },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.data.success && response.data.subscription) {
      return response.data.subscription;
    }
    throw new Error('Failed to update subscription status');
  } catch (error) {
    console.error(`Error updating subscription status for client ${clientId}:`, error);
    throw error;
  }
};

/**
 * Update subscription plan for a client
 * 
 * Valid plans:
 * - 'professional'
 * - 'business'
 * - 'enterprise'
 */
export const updateSubscriptionPlan = async (
  clientId: number,
  plan: SubscriptionPlan
): Promise<SubscriptionObject> => {
  // Validate plan
  const validPlans: SubscriptionPlan[] = ['professional', 'business', 'enterprise'];
  if (!validPlans.includes(plan)) {
    throw new Error(`Invalid plan. Must be one of: ${validPlans.join(', ')}`);
  }

  try {
    const response = await axiosInstance.post(
      `/admin/clients/${clientId}/subscription/plan`,
      { plan },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.data.success && response.data.subscription) {
      return response.data.subscription;
    }
    throw new Error('Failed to update subscription plan');
  } catch (error) {
    console.error(`Error updating subscription plan for client ${clientId}:`, error);
    throw error;
  }
};

/**
 * Format date string to readable format
 */
export const formatSubscriptionDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Calculate days until expiry
 */
export const daysUntilExpiry = (endsAt: string): number => {
  const now = new Date();
  const expiry = new Date(endsAt);
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysLeft);
};

/**
 * Get subscription status label for display
 * 
 * Entitlement Rule:
 * is_entitled = true if and only if:
 *   status === 'active' AND ends_at > now()
 */
export const getSubscriptionLabel = (subscription: SubscriptionObject | null): string => {
  if (!subscription) {
    return 'Free tier';
  }

  if (subscription.status === 'expired') {
    return 'Expired';
  }

  if (subscription.status === 'canceled') {
    return 'Canceled';
  }

  if (subscription.is_trial) {
    const daysLeft = daysUntilExpiry(subscription.ends_at);
    return `Trial - ${daysLeft} days left`;
  }

  return subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
};

/**
 * Get status badge color classes
 * Maps subscription status to Tailwind classes
 */
export const getStatusBadgeClasses = (status: SubscriptionStatus | null): string => {
  const classes: Record<SubscriptionStatus | string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    canceled: 'bg-orange-100 text-orange-700',
  };
  return classes[status || ''] || 'bg-gray-100 text-gray-700';
};

/**
 * Check if user is entitled to premium features
 * 
 * ALWAYS use this for feature access control decisions
 * 
 * is_entitled = true if and only if:
 *   status === 'active' AND ends_at > now()
 */
export const isUserEntitled = (subscription: SubscriptionObject | null): boolean => {
  if (!subscription) return false;
  return subscription.is_entitled === true;
};

/**
 * Validate subscription response from backend
 * Helps catch API issues or data inconsistencies
 */
export const validateSubscriptionResponse = (subscription: SubscriptionObject): string[] => {
  const errors: string[] = [];
  const validStatuses: SubscriptionStatus[] = ['active', 'expired', 'canceled'];
  const validPlans = ['professional', 'business', 'enterprise'];
  const validPeriods = ['monthly', 'yearly'];

  if (!validStatuses.includes(subscription.status)) {
    errors.push(`Invalid status: ${subscription.status}`);
  }

  if (!validPlans.includes(subscription.plan)) {
    errors.push(`Invalid plan: ${subscription.plan}`);
  }

  if (!validPeriods.includes(subscription.period)) {
    errors.push(`Invalid period: ${subscription.period}`);
  }

  if (typeof subscription.is_entitled !== 'boolean') {
    errors.push('is_entitled must be a boolean');
  }

  if (typeof subscription.is_trial !== 'boolean') {
    errors.push('is_trial must be a boolean');
  }

  // Validate trial constraints
  if (subscription.is_trial) {
    if (subscription.plan !== 'professional') {
      errors.push('Trial subscriptions must be professional plan');
    }
    if (subscription.period !== 'monthly') {
      errors.push('Trial subscriptions must be monthly period');
    }
  }

  // Validate dates
  const startDate = new Date(subscription.started_at);
  const endDate = new Date(subscription.ends_at);
  if (isNaN(startDate.getTime())) {
    errors.push('Invalid started_at date');
  }
  if (isNaN(endDate.getTime())) {
    errors.push('Invalid ends_at date');
  }
  if (startDate >= endDate) {
    errors.push('started_at must be before ends_at');
  }

  return errors;
};
