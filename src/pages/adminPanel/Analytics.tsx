import React, { useState, useEffect } from 'react';
import { adminClientsApi, adminLeadsApi } from '../../api';
import StatCard from '../../components/StatCard';
import type { StatCardProps } from '../../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

interface ClientWithSub {
  id: number;
  company_name: string;
  status: string;
  created_at: string;
  subscription?: { plan: string; status: string; is_entitled: boolean };
}

interface Lead {
  id: number;
  client_id: number;
  status: string;
}

const COLORS = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', '#8B5CF6', 'var(--color-error)'];

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [clientGrowth, setClientGrowth] = useState<{ date: string; count: number }[]>([]);
  const [planDist, setPlanDist] = useState<{ name: string; value: number }[]>([]);
  const [leadStatus, setLeadStatus] = useState<{ status: string; count: number }[]>([]);
  const [topClients, setTopClients] = useState<{ name: string; conversations: number; plan: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allClientsRes, activeClientsRes, subsRes, leadsRes] = await Promise.allSettled([
        adminClientsApi.getAllClients(),
        adminClientsApi.getClientsByStatus('active'),
        adminClientsApi.getClientsWithSubscriptions('active'),
        adminLeadsApi.getLeads({ limit: 100 }),
      ]);

      const allClients = allClientsRes.status === 'fulfilled' ? (allClientsRes.value?.clients || []) : [];
      const totalClients = allClientsRes.status === 'fulfilled' ? (allClientsRes.value?.count ?? allClients.length) : 0;
      const activeCount = activeClientsRes.status === 'fulfilled' ? (activeClientsRes.value?.count ?? 0) : 0;
      const subsClients: ClientWithSub[] = subsRes.status === 'fulfilled' ? (subsRes.value?.clients || []) : [];
      const leadsData = leadsRes.status === 'fulfilled' ? leadsRes.value : null;
      const totalLeads = leadsData?.pagination?.total ?? 0;
      const leads: Lead[] = leadsData?.items || [];

      // Conversations per client (top 10)
      const convResults = await Promise.allSettled(
        subsClients.slice(0, 15).map(c => adminClientsApi.getClientConversations(c.id, { limit: 1 }))
      );
      const clientConvs = subsClients.slice(0, 15).map((c, i) => ({
        name: c.company_name,
        conversations: convResults[i].status === 'fulfilled' ? (convResults[i].value?.pagination?.total_count ?? 0) : 0,
        plan: c.subscription?.plan ? capitalize(c.subscription.plan) : '—',
      }));

      const totalConvs = clientConvs.reduce((s, c) => s + c.conversations, 0);
      const avgConvs = totalClients > 0 ? (totalConvs / totalClients).toFixed(1) : '0';

      setStats([
        { icon: 'people', label: 'Total Clients', value: totalClients.toString(), change: `${totalClients} registered`, changeType: 'positive', iconColor: 'blue' },
        { icon: 'live', label: 'Active Clients', value: activeCount.toString(), change: `${activeCount} active`, changeType: 'positive', iconColor: 'green' },
        { icon: 'users', label: 'Total Leads', value: totalLeads.toString(), change: `${totalLeads} system-wide`, changeType: 'positive', iconColor: 'purple' },
        { icon: 'chat', label: 'Avg Conversations', value: avgConvs, change: 'Per client', changeType: 'positive', iconColor: 'orange' },
      ]);

      // Client growth (group by date over last 90 days)
      const now = new Date();
      const daysAgo90 = new Date(now.getTime() - 90 * 86400000);
      const dateMap: Record<string, number> = {};
      allClients.forEach((c: any) => {
        const d = new Date(c.created_at);
        if (d >= daysAgo90) {
          const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dateMap[key] = (dateMap[key] || 0) + 1;
        }
      });
      setClientGrowth(Object.entries(dateMap).map(([date, count]) => ({ date, count })));

      // Plan distribution
      const plans: Record<string, number> = {};
      subsClients.forEach(c => {
        if (c.subscription?.plan) {
          const p = capitalize(c.subscription.plan);
          plans[p] = (plans[p] || 0) + 1;
        }
      });
      setPlanDist(Object.entries(plans).map(([name, value]) => ({ name, value })));

      // Lead status distribution
      const statuses: Record<string, number> = {};
      leads.forEach(l => {
        const s = capitalize(l.status || 'new');
        statuses[s] = (statuses[s] || 0) + 1;
      });
      setLeadStatus(Object.entries(statuses).map(([status, count]) => ({ status, count })));

      // Top clients by conversations
      setTopClients(clientConvs.sort((a, b) => b.conversations - a.conversations).slice(0, 10));
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-[var(--color-error)]">{error}</p>
        <button className="btn btn-primary" onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Track performance metrics and insights across all clients.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-11 w-11 rounded-lg bg-[var(--color-bg-light)] mb-4" />
                <div className="h-3 w-20 bg-[var(--color-bg-light)] rounded mb-2" />
                <div className="h-6 w-16 bg-[var(--color-bg-light)] rounded" />
              </div>
            ))
          : stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">Client Growth (Last 90 Days)</h3>
          {clientGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={clientGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[var(--color-text-secondary)] text-small">
              {loading ? 'Loading...' : 'No data available'}
            </div>
          )}
        </div>

        {/* Subscription Distribution */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">Subscription Distribution</h3>
          {planDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {planDist.map((e, i) => (
                  <div key={e.name} className="flex items-center gap-2 text-small">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[var(--color-text-secondary)]">{e.name}: {e.value}</span>
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

        {/* Lead Status */}
        <div className="card p-6">
          <h3 className="text-h3 text-[var(--color-text-primary)] mb-4">Lead Status Distribution</h3>
          {leadStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={leadStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-[var(--color-text-secondary)] text-small">
              {loading ? 'Loading...' : 'No lead data'}
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)]">Top Clients by Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <th className="table-header-cell">Company</th>
                  <th className="table-header-cell">Conversations</th>
                  <th className="table-header-cell">Plan</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="table-cell text-center text-[var(--color-text-secondary)]">Loading...</td></tr>
                ) : topClients.length > 0 ? (
                  topClients.map((c, i) => (
                    <tr key={i} className="table-row border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="table-cell font-semibold text-[var(--color-text-primary)]">{c.name}</td>
                      <td className="table-cell text-[var(--color-text-secondary)]">{c.conversations}</td>
                      <td className="table-cell"><span className="badge badge-primary">{c.plan}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="table-cell text-center text-[var(--color-text-secondary)] py-8">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
