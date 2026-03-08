// types/index.ts

// Common types
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
export type ChangeType = 'positive' | 'negative';
export type IconColor = 'blue' | 'purple' | 'green' | 'orange' | 'red';

// Auth Types
export type UserRole = 'super_admin' | 'client';

export interface UserRoleInfo {
  role: UserRole;
  clientId?: number | string;
}

// Stat Card Props
export interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: ChangeType;
  iconColor?: IconColor;
}

// Top Header Props
export interface TopHeaderProps {
  currentPage?: string;
}

// Client Data
export interface Client {
  name: string;
  email: string;
  plan: string;
  chatbots: number;
  mrr: string;
  status: string;
}

// Chatbot Data
export interface Chatbot {
  name: string;
  client: string;
  model: string;
  conversations: string;
  status: string;
}

// Subscription Status Type (3 valid values - CLIENT ROLE ONLY)
// Note: 'inactive' is NOT a valid subscription status
// Client inactive status is managed separately in clients table
export type SubscriptionStatus = 'active' | 'expired' | 'canceled';

// Subscription Period Type
export type SubscriptionPeriod = 'monthly' | 'yearly';

// Subscription Plan Type
export type SubscriptionPlan = 'professional' | 'business' | 'enterprise';

// Subscription Object (from API)
// IMPORTANT: Only client role users have subscriptions
// Super admin users (role='super_admin') will never have subscriptions
export interface SubscriptionObject {
  plan: SubscriptionPlan;
  period: SubscriptionPeriod;
  status: SubscriptionStatus;
  is_trial: boolean;
  started_at: string; // ISO date string
  ends_at: string; // ISO date string
  is_entitled: boolean; // Computed: status === 'active' AND ends_at > now()
}

// Subscription Data (for table display)
export interface Subscription {
  client_id: number;
  client: string;
  subscription: SubscriptionObject | null;
  has_subscription: boolean;
}

// Recent Activity Data
export interface Activity {
  client: string;
  action: string;
  plan: string;
  status: string;
  date: string;
}

// Usage Data
export interface Usage {
  client: string;
  apiCalls: string;
  storage: string;
  bandwidth: string;
  cost: string;
}

// Integration Data
export interface Integration {
  name: string;
  icon: string;
  description: string;
  status: 'Connected' | 'Available';
  color: 'purple' | 'blue';
}

// Security Log Data
export interface SecurityLog {
  action: string;
  user: string;
  ip: string;
  location: string;
  time: string;
  status: 'success' | 'failed';
}

// Settings State
export interface SettingsState {
  platformName: string;
  supportEmail: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  webhookUrl: string;
  apiKey: string;
}