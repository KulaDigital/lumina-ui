import React, { useState, useEffect, useMemo } from 'react';
import { clientApi } from '../../api';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';
import type { StatCardProps } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────
interface Conversation {
  id: string | number;
  visitor_id?: string;
  status?: string;
  message_count?: number;
  created_at?: string;
  updated_at?: string;
  last_activity?: string;
}

interface Lead {
  id: number;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────
const groupByDate = (conversations: Conversation[]) => {
  const grouped: Record<string, number> = {};
  conversations.forEach((conv) => {
    if (!conv.created_at) return;
    const date = new Date(conv.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const countByStatus = (leads: Lead[]) => {
  return leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
};

const LEAD_COLORS: Record<string, string> = {
  new: '#3B82F6',
  contacted: '#F59E0B',
  qualified: '#10B981',
  won: '#059669',
  lost: '#EF4444',
};

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#059669', '#EF4444'];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ── Component ──────────────────────────────────────────────────────────
const Analytics: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);
  const ACTIVITY_LIMIT = 20;

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [convRes, leadsRes] = await Promise.allSettled([
        clientApi.getConversations({}),
        clientApi.getLeads('/leads?limit=1000'),
      ]);

      if (convRes.status === 'fulfilled') {
        const data = convRes.value;
        setConversations(data?.conversations ?? data?.data ?? []);
      }

      if (leadsRes.status === 'fulfilled') {
        const data = leadsRes.value;
        setLeads(data?.items ?? data?.data ?? []);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Computed metrics ───────────────────────────────────────────────
  const totalConversations = conversations.length;
  const activeConversations = conversations.filter(
    (c) => c.status?.toLowerCase() === 'active'
  ).length;
  const closedConversations = conversations.filter(
    (c) => c.status?.toLowerCase() === 'closed' || c.status?.toLowerCase() === 'ended'
  ).length;
  const totalLeads = leads.length;

  const stats: StatCardProps[] = [
    {
      icon: 'chat',
      label: 'Total Conversations',
      value: totalConversations.toString(),
      change: `${totalConversations} recorded`,
      changeType: totalConversations > 0 ? 'positive' : 'negative',
      iconColor: 'blue',
    },
    {
      icon: 'live',
      label: 'Active Conversations',
      value: activeConversations.toString(),
      change: activeConversations > 0 ? 'Ongoing' : 'None active',
      changeType: activeConversations > 0 ? 'positive' : 'negative',
      iconColor: 'green',
    },
    {
      icon: 'close',
      label: 'Closed Conversations',
      value: closedConversations.toString(),
      change: `${closedConversations} resolved`,
      changeType: 'positive',
      iconColor: 'red',
    },
    {
      icon: 'users',
      label: 'Total Leads',
      value: totalLeads.toString(),
      change: totalLeads > 0 ? `${totalLeads} captured` : 'No leads yet',
      changeType: totalLeads > 0 ? 'positive' : 'negative',
      iconColor: 'purple',
    },
  ];

  // ── Chart data ─────────────────────────────────────────────────────
  const last30Days = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return conversations.filter(
      (c) => c.created_at && new Date(c.created_at) >= cutoff
    );
  }, [conversations]);

  const trendData = useMemo(() => groupByDate(last30Days), [last30Days]);

  const leadStatusData = useMemo(() => {
    const counts = countByStatus(leads);
    return Object.entries(counts).map(([status, count]) => ({
      name: capitalize(status),
      value: count,
      fill: LEAD_COLORS[status] || '#94A3B8',
    }));
  }, [leads]);

  // ── Activity table pagination ──────────────────────────────────────
  const sortedConversations = useMemo(
    () =>
      [...conversations].sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at || 0).getTime() -
          new Date(a.updated_at || a.created_at || 0).getTime()
      ),
    [conversations]
  );
  const totalActivityPages = Math.ceil(sortedConversations.length / ACTIVITY_LIMIT);
  const paginatedActivity = sortedConversations.slice(
    (activityPage - 1) * ACTIVITY_LIMIT,
    activityPage * ACTIVITY_LIMIT
  );

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--color-text-secondary)]">Loading analytics…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Detailed metrics calculated from your real data.</p>
      </div>

      {/* A. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* B. Conversation Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)]">Conversation Trends (30 days)</h3>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-white)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="count" name="Conversations" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)] text-sm">
                No conversation data in the last 30 days.
              </div>
            )}
          </div>
        </div>

        {/* C. Lead Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-h3 text-[var(--color-text-primary)]">Lead Status Breakdown</h3>
          </div>
          <div className="card-body" style={{ minHeight: 400, height: 400 }}>
            {leadStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadStatusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leadStatusData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-white)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 16 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[var(--color-text-secondary)] text-sm">
                No leads captured yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* D. Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-h3 text-[var(--color-text-primary)]">Recent Activity</h3>
          <span className="text-small text-[var(--color-text-secondary)]">
            {sortedConversations.length} conversations
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="table-header-cell">Visitor ID</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Messages</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivity.length > 0 ? (
                paginatedActivity.map((conv) => (
                  <tr
                    key={conv.id}
                    className="table-row border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
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
                      {formatDate(conv.created_at)}
                    </td>
                    <td className="table-cell text-small text-[var(--color-text-secondary)]">
                      {formatDate(conv.last_activity || conv.updated_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="table-cell text-center text-[var(--color-text-secondary)] py-8"
                  >
                    No conversations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalActivityPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-light)' }}>
            <p className="text-small text-[var(--color-text-secondary)]">
              Page {activityPage} of {totalActivityPages}
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-outline text-small"
                disabled={activityPage <= 1}
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                className="btn btn-outline text-small"
                disabled={activityPage >= totalActivityPages}
                onClick={() => setActivityPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
