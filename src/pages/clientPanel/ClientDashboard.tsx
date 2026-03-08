import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';
import type { StatCardProps } from '../../types';

interface Conversation {
  id: string | number;
  visitor_id?: string;
  status?: string;
  message_count?: number;
  last_activity?: string;
  updated_at?: string;
  created_at?: string;
}

interface PaginatedResponse<T> {
  data?: T[];
  conversations?: T[];
  pagination?: {
    total_count?: number;
    total?: number;
  };
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const userName = userRole?.userName || 'User';

  const quickActions = [
    { icon: 'chat', label: 'View All Conversations', description: 'Browse all chatbot conversations', path: '/client/conversations' },
    { icon: 'users', label: 'Manage Leads', description: 'View and manage captured leads', path: '/client/leads' },
    { icon: 'chatbot', label: 'Test Chatbot', description: 'Test your chatbot live', path: '/client/test-chatbot' },
    { icon: 'analytics', label: 'View Analytics', description: 'View performance metrics', path: '/client/analytics' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [profileRes, convRes, activeConvRes, leadsRes] = await Promise.allSettled([
        clientApi.getClientProfile(),
        clientApi.getConversations({ limit: 5, sort: 'recent' }),
        clientApi.getConversations({ status: 'active', limit: 1 }),
        clientApi.getLeads('/client/leads?limit=1'),
      ]);

      // Extract total conversations
      const convData = convRes.status === 'fulfilled' ? convRes.value as PaginatedResponse<Conversation> : null;
      const totalConversations = convData?.pagination?.total_count ?? convData?.pagination?.total ?? 0;
      const conversations = convData?.conversations ?? convData?.data ?? [];
      setRecentConversations(conversations.slice(0, 5));

      // Extract active conversations count
      const activeData = activeConvRes.status === 'fulfilled' ? activeConvRes.value as PaginatedResponse<Conversation> : null;
      const activeCount = activeData?.pagination?.total_count ?? activeData?.pagination?.total ?? 0;

      // Extract leads count
      const leadsData = leadsRes.status === 'fulfilled' ? leadsRes.value : null;
      const totalLeads = leadsData?.pagination?.total ?? leadsData?.pagination?.total_count ?? 0;

      // Extract subscription
      const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null;
      const sub = profileData?.subscription;

      // Calculate trial days remaining
      let subChange = sub?.status === 'active' ? 'Active' : (sub?.status || 'N/A');
      if (sub?.is_trial && sub?.ends_at) {
        const daysLeft = Math.max(0, Math.ceil((new Date(sub.ends_at).getTime() - Date.now()) / 86400000));
        subChange = `${daysLeft} days remaining`;
      }

      setStats([
        {
          icon: 'chat',
          label: 'Total Conversations',
          value: totalConversations.toString(),
          change: totalConversations > 0 ? `${totalConversations} total` : 'No conversations yet',
          changeType: totalConversations > 0 ? 'positive' : 'negative',
          iconColor: 'blue',
        },
        {
          icon: 'live',
          label: 'Active Conversations',
          value: activeCount.toString(),
          change: activeCount > 0 ? `${activeCount} ongoing` : 'None active',
          changeType: activeCount > 0 ? 'positive' : 'negative',
          iconColor: 'green',
        },
        {
          icon: 'users',
          label: 'Total Leads',
          value: totalLeads.toString(),
          change: totalLeads > 0 ? `${totalLeads} captured` : 'No leads yet',
          changeType: totalLeads > 0 ? 'positive' : 'negative',
          iconColor: 'purple',
        },
        {
          icon: 'star',
          label: 'Subscription Plan',
          value: sub?.plan ? capitalize(sub.plan) : 'N/A',
          change: subChange,
          changeType: sub?.status === 'active' ? 'positive' : 'negative',
          iconColor: 'orange',
        },
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStats(getFallbackStats());
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const getFallbackStats = (): StatCardProps[] => [
    { icon: 'chat', label: 'Total Conversations', value: '—', change: 'Unable to load', changeType: 'negative', iconColor: 'blue' },
    { icon: 'live', label: 'Active Conversations', value: '—', change: 'Unable to load', changeType: 'negative', iconColor: 'green' },
    { icon: 'users', label: 'Total Leads', value: '—', change: 'Unable to load', changeType: 'negative', iconColor: 'purple' },
    { icon: 'star', label: 'Subscription Plan', value: 'N/A', change: 'Unable to load', changeType: 'negative', iconColor: 'orange' },
  ];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'badge badge-success';
      case 'closed':
      case 'ended':
        return 'badge badge-error';
      default:
        return 'badge badge-info';
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Welcome Header */}
      <div className="page-header">
        <h1>Welcome back, {userName}!</h1>
        <p>{currentDate}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.length > 0
          ? stats.map((stat, i) => <StatCard key={i} {...stat} />)
          : getFallbackStats().map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* Recent Conversations Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-h3 text-[var(--color-text-primary)]">Recent Conversations</h3>
          <button
            className="btn btn-outline text-small"
            onClick={() => navigate('/client/conversations')}
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="table-header-cell">Visitor ID</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Messages</th>
                <th className="table-header-cell">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="table-cell text-center text-[var(--color-text-secondary)]">
                    Loading...
                  </td>
                </tr>
              ) : recentConversations.length > 0 ? (
                recentConversations.map((conv) => (
                  <tr key={conv.id} className="table-row border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="table-cell text-small font-medium text-[var(--color-text-primary)]">
                      {conv.visitor_id || `#${conv.id}`}
                    </td>
                    <td className="table-cell">
                      <span className={getStatusBadge(conv.status)}>
                        {conv.status ? capitalize(conv.status) : 'Unknown'}
                      </span>
                    </td>
                    <td className="table-cell text-small text-[var(--color-text-secondary)]">
                      {conv.message_count ?? '—'}
                    </td>
                    <td className="table-cell text-small text-[var(--color-text-secondary)]">
                      {formatDate(conv.last_activity || conv.updated_at || conv.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="table-cell text-center text-[var(--color-text-secondary)] py-8">
                    No conversations yet. Start by testing your chatbot!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-h2 text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => navigate(action.path)}
              className="card p-5 cursor-pointer group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110"
                style={{
                  background: 'var(--color-primary-light)',
                  transition: 'transform var(--transition-base)',
                }}
              >
                <Icon name={action.icon} size="md" decorative />
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{action.label}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">{action.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
