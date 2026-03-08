import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, clientApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Icon from '../../components/Icon';

interface MeData {
  role?: string;
  client_id?: number | string;
  user_name?: string;
  phone_number?: string;
  subscription?: {
    plan: string;
    period: string;
    status: string;
    is_trial: boolean;
    started_at: string;
    ends_at: string;
    is_entitled: boolean;
  };
  has_subscription?: boolean;
}

interface ClientMeData {
  role?: string;
  client_id?: number | string;
  company_name?: string;
  website_url?: string;
  subscription?: {
    plan: string;
    period: string;
    status: string;
    is_trial: boolean;
    started_at: string;
    ends_at: string;
    is_entitled: boolean;
  };
  has_subscription?: boolean;
  widget?: {
    primary_color?: string;
    secondary_color?: string;
    position?: string;
    welcome_message?: string;
  };
}

interface CombinedProfile {
  role?: string;
  client_id?: number | string;
  user_name?: string;
  phone_number?: string;
  company_name?: string;
  website_url?: string;
  subscription?: MeData['subscription'];
  has_subscription?: boolean;
  widget?: ClientMeData['widget'];
}

const PLACEHOLDER = 'Contact admin for details';

const formatDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—');

// ── Reusable row ───────────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
    <span className="text-small font-semibold text-[var(--color-text-secondary)] sm:w-44 shrink-0">{label}</span>
    <span className="text-small text-[var(--color-text-primary)]">{children}</span>
  </div>
);

const ColorSwatch: React.FC<{ color?: string }> = ({ color }) => {
  if (!color) return <span className="text-[var(--color-text-secondary)]">{PLACEHOLDER}</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block w-5 h-5 rounded border"
        style={{ backgroundColor: color, borderColor: 'var(--color-border)' }}
      />
      <span>{color}</span>
    </span>
  );
};

// ── Main component ─────────────────────────────────────────────────────
const ClientSettings: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [profile, setProfile] = useState<CombinedProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, clientRes] = await Promise.all([
          authApi.getMe(true).catch(() => null),
          clientApi.getClientProfile().catch(() => null),
        ]);

        const combined: CombinedProfile = {
          role: meRes?.role || clientRes?.role,
          client_id: meRes?.client_id || clientRes?.client_id,
          user_name: meRes?.user_name,
          phone_number: meRes?.phone_number,
          company_name: clientRes?.company_name,
          website_url: clientRes?.website_url,
          subscription: clientRes?.subscription || meRes?.subscription,
          has_subscription: clientRes?.has_subscription ?? meRes?.has_subscription,
          widget: clientRes?.widget,
        };

        setProfile(combined);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--color-text-secondary)]">Loading settings…</p>
      </div>
    );
  }

  const sub = profile?.subscription;
  const widget = profile?.widget;

  const statusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'badge badge-success';
      case 'expired':
        return 'badge badge-error';
      case 'canceled':
        return 'badge badge-warning';
      default:
        return 'badge badge-info';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="page-header">
        <h1>Settings</h1>
        <p>Your account information at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. User Profile */}
        <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)] flex items-center gap-2">
              <Icon name="users" size="md" decorative />
              User Profile
            </h3>
          </div>
          <div className="card-body">
            <InfoRow label="User Name">{profile?.user_name || userRole?.userName || '—'}</InfoRow>
            <InfoRow label="Phone Number">{profile?.phone || PLACEHOLDER}</InfoRow>
            <InfoRow label="Role">{capitalize(profile?.role || userRole?.role)}</InfoRow>
            <InfoRow label="Account Status">
              <span className="badge badge-success">Active</span>
            </InfoRow>
          </div>
        </div>

        {/* B. Company Information */}
        <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)] flex items-center gap-2">
              <Icon name="home" size="md" decorative />
              Company Information
            </h3>
          </div>
          <div className="card-body">
            <InfoRow label="Company Name">{profile?.company_name || PLACEHOLDER}</InfoRow>
            <InfoRow label="Website URL">
              {profile?.website_url ? (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline break-all"
                >
                  {profile.website_url}
                </a>
              ) : (
                PLACEHOLDER
              )}
            </InfoRow>
            <InfoRow label="Client ID">{profile?.client_id ?? userRole?.clientId ?? '—'}</InfoRow>
          </div>
        </div>

        {/* C. Subscription */}
        <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)] flex items-center gap-2">
              <Icon name="subscription" size="md" decorative />
              Subscription
            </h3>
          </div>
          <div className="card-body">
            <InfoRow label="Plan">{capitalize(sub?.plan)}</InfoRow>
            <InfoRow label="Period">{capitalize(sub?.period)}</InfoRow>
            <InfoRow label="Status">
              <span className={statusBadge(sub?.status)}>{capitalize(sub?.status)}</span>
            </InfoRow>
            <InfoRow label="Is Trial">{sub?.is_trial ? 'Yes' : 'No'}</InfoRow>
            <InfoRow label="Started">{formatDate(sub?.started_at)}</InfoRow>
            <InfoRow label="Expires">{formatDate(sub?.ends_at)}</InfoRow>
            <div className="pt-4">
              <button className="btn btn-primary" onClick={() => navigate('/client/subscription')}>
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* D. Widget Configuration */}
        <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)] flex items-center gap-2">
              <Icon name="chatbot" size="md" decorative />
              Widget Configuration
            </h3>
          </div>
          <div className="card-body">
            <InfoRow label="Primary Color"><ColorSwatch color={widget?.primary_color} /></InfoRow>
            <InfoRow label="Secondary Color"><ColorSwatch color={widget?.secondary_color} /></InfoRow>
            <InfoRow label="Position">{widget?.position ? capitalize(widget.position) : PLACEHOLDER}</InfoRow>
            <InfoRow label="Welcome Message">{widget?.welcome_message || PLACEHOLDER}</InfoRow>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSettings;
