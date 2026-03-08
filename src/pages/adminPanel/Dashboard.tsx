import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminClientsApi, adminLeadsApi } from '../../api';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';
import type { StatCardProps } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ClientWithSub {
  id: number;
  company_name: string;
  status: string;
  created_at: string;
  subscription?: {
    plan: string;
    status: string;
    is_entitled: boolean;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [recentClients, setRecentClients] = useState<ClientWithSub[]>([]);
  const [planDistribution, setPlanDistribution] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CHART_COLORS = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', '#8B5CF6'];

  const quickActions = [
    { icon: 'plus', label: 'Add New Client', path: '/SA/clients' },
    { icon: 'users', label: 'View All Clients', path: '/SA/clients' },
    { icon: 'people', label: 'Manage Users', path: '/SA/users' },
    { icon: 'analytics', label: 'View Analytics', path: '/SA/analytics' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsRes, subsRes, leadsRes] = await Promise.allSettled([
        adminClientsApi.getAllClients(),
        adminClientsApi.getClientsWithSubscriptions('active'),
        adminLeadsApi.getLeads({ limit: 1 }),
      ]);

      // Total clients
      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value?.clients || []) : [];
      const totalClients = clientsRes.status === 'fulfilled' ? (clientsRes.value?.count ?? clients.length) : 0;

      // Active subscriptions
      const subsClients: ClientWithSub[] = subsRes.status === 'fulfilled' ? (subsRes.value?.clients || []) : [];
      const activeSubs = subsClients.filter(c => c.subscription?.is_entitled).length;

      // Leads
      const totalLeads = leadsRes.status === 'fulfilled' ? (leadsRes.value?.pagination?.total ?? 0) : 0;

      // Total conversations - sum from subscription clients data
      let totalConvs = 0;
      try {
        const convResults = await Promise.allSettled(
          subsClients.slice(0, 10).map(c => adminClientsApi.getClientConversations(c.id, { limit: 1 }))
        );
        totalConvs = convResults.reduce((sum, r) => {
          if (r.status === 'fulfilled') {
            return sum + (r.value?.pagination?.total_count ?? 0);
          }
          return sum;
        }, 0);
      } catch { /* ignore */ }

      setStats([
        { icon: 'people', label: 'Total Clients', value: totalClients.toString(), change: 'Active clients', changeType: 'positive', iconColor: 'blue' },
        { icon: 'subscription', label: 'Active Subscriptions', value: activeSubs.toString(), change: 'Paying customers', changeType: 'positive', iconColor: 'green' },
        { icon: 'chat', label: 'Total Conversations', value: totalConvs.toString(), change: 'Across all clients', changeType: 'positive', iconColor: 'purple' },
        { icon: 'users', label: 'Total Leads', value: totalLeads.toString(), change: 'Captured leads', changeType: 'positive', iconColor: 'orange' },
      ]);

      // Recent clients (sorted by created_at desc)
      const sorted = [...subsClients].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentClients(sorted.slice(0, 5));

      // Plan distribution
      const planCounts: Record<string, number> = {};
      subsClients.forEach(c => {
        if (c.subscription?.plan) {
          const plan = capitalize(c.subscription.plan);
          planCounts[plan] = (planCounts[plan] || 0) + 1;
        }
      });
      setPlanDistribution(Object.entries(planCounts).map(([name, value]) => ({ name, value })));
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[var(--color-error)]">{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Page Header */}
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-11 w-11 rounded-lg bg-[var(--color-bg-light)] mb-4" />
                <div className="h-3 w-20 bg-[var(--color-bg-light)] rounded mb-2" />
                <div className="h-6 w-16 bg-[var(--color-bg-light)] rounded" />
              </div>
            ))
          : stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Client Activity Table */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)]">Recent Client Activity</h3>
            <button className="btn btn-outline text-small" onClick={() => navigate('/SA/clients')}>View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="table-header-cell">Company</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Plan</th>
                  <th className="table-header-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="table-cell text-center text-[var(--color-text-secondary)]">Loading...</td></tr>
                ) : recentClients.length > 0 ? (
                  recentClients.map(client => (
                    <tr key={client.id} className="table-row border-b cursor-pointer" style={{ borderColor: 'var(--color-border)' }} onClick={() => navigate('/SA/clients')}>
                      <td className="table-cell font-semibold text-[var(--color-text-primary)]">{client.company_name}</td>
                      <td className="table-cell">
                        <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                          {capitalize(client.status)}
                        </span>
                      </td>
                      <td className="table-cell text-[var(--color-text-secondary)]">
                        {client.subscription?.plan ? capitalize(client.subscription.plan) : '—'}
                      </td>
                      <td className="table-cell text-small text-[var(--color-text-secondary)]">{formatDate(client.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="table-cell text-center text-[var(--color-text-secondary)] py-8">No clients yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">Subscription Plans</h3>
          {planDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {planDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-3">
                {planDistribution.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2 text-small">
                    <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[var(--color-text-secondary)]">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[var(--color-text-secondary)] text-small">
              {loading ? 'Loading...' : 'No subscription data'}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-h2 text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <div key={i} onClick={() => navigate(action.path)} className="card p-5 cursor-pointer group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110" style={{ background: 'var(--color-primary-light)', transition: 'transform var(--transition-base)' }}>
                <Icon name={action.icon} size="md" decorative />
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)] text-sm">{action.label}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
