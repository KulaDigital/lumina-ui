import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, adminClientsApi, adminUsersApi } from '../../api';
import Icon from '../../components/Icon';

interface AdminProfile {
  user_name?: string;
  role?: string;
  user_id?: string;
  status?: string;
}

interface SystemInfo {
  totalClients: number;
  totalUsers: number;
  activeSubscriptions: number;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ totalClients: 0, totalUsers: 0, activeSubscriptions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, clientsRes, usersRes, subsRes] = await Promise.allSettled([
        authApi.getMe(true),
        adminClientsApi.getAllClients(),
        adminUsersApi.getAllUsers(),
        adminClientsApi.getClientsWithSubscriptions('active'),
      ]);

      if (meRes.status === 'fulfilled') {
        setProfile({
          user_name: meRes.value?.user_name || 'Admin',
          role: meRes.value?.role || 'super_admin',
          user_id: meRes.value?.user_id || meRes.value?.id || '—',
          status: 'active',
        });
      }

      const totalClients = clientsRes.status === 'fulfilled' ? (clientsRes.value?.count ?? 0) : 0;
      const totalUsers = usersRes.status === 'fulfilled' ? (usersRes.value?.count ?? 0) : 0;
      const subsClients = subsRes.status === 'fulfilled' ? (subsRes.value?.clients || []) : [];
      const activeSubs = subsClients.filter((c: any) => c.subscription?.is_entitled).length;

      setSystemInfo({ totalClients, totalUsers, activeSubscriptions: activeSubs });
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: 'users', label: 'View All Clients', path: '/SA/clients' },
    { icon: 'people', label: 'View All Users', path: '/SA/users' },
    { icon: 'logs', label: 'System Logs', path: '/SA/active-logs', placeholder: true },
    { icon: 'storage', label: 'Backup Data', path: '#', placeholder: true },
  ];

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[var(--color-error)]">{error}</p>
        <button className="btn btn-primary" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-small text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-small font-medium text-[var(--color-text-primary)]">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="page-header">
        <h1>Settings</h1>
        <p>System settings and admin profile overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">Admin Profile</h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-5 bg-[var(--color-bg-light)] rounded" />)}
            </div>
          ) : (
            <div>
              <InfoRow label="User Name" value={profile?.user_name || '—'} />
              <InfoRow label="Role" value="Super Admin" />
              <InfoRow label="User ID" value={profile?.user_id || '—'} />
              <div className="flex items-center justify-between py-3">
                <span className="text-small text-[var(--color-text-secondary)]">Status</span>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">System Information</h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-5 bg-[var(--color-bg-light)] rounded" />)}
            </div>
          ) : (
            <div>
              <InfoRow label="Total Clients" value={systemInfo.totalClients} />
              <InfoRow label="Total Users" value={systemInfo.totalUsers} />
              <InfoRow label="Active Subscriptions" value={systemInfo.activeSubscriptions} />
              <div className="flex items-center justify-between py-3">
                <span className="text-small text-[var(--color-text-secondary)]">System Status</span>
                <span className="badge badge-success">Operational</span>
              </div>
            </div>
          )}
        </div>

        {/* API Configuration */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">API Configuration</h3>
          <div>
            <InfoRow label="AI Model" value="GPT-4O Mini" />
            <InfoRow label="Embedding Model" value="text-embedding-3-small" />
            <InfoRow label="Vector Dimensions" value="1536" />
            <div className="mt-4 p-3 rounded-md" style={{ background: 'var(--color-primary-light)' }}>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Contact the development team to modify API settings.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => !action.placeholder ? navigate(action.path) : undefined}
                className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                  action.placeholder
                    ? 'opacity-50 cursor-not-allowed bg-[var(--color-bg-light)]'
                    : 'hover:bg-[var(--color-bg-light)] cursor-pointer'
                }`}
                style={{ border: '1px solid var(--color-border)' }}
              >
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                  <Icon name={action.icon} size="sm" decorative />
                </div>
                <span className="text-small font-medium text-[var(--color-text-primary)]">{action.label}</span>
                {action.placeholder && <span className="ml-auto badge badge-warning text-xs">Coming Soon</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
