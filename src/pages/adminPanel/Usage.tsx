import React, { useState, useEffect, useMemo } from 'react';
import { adminClientsApi, adminLeadsApi } from '../../api';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';
import type { StatCardProps } from '../../types';

interface ClientUsage {
  id: number;
  company_name: string;
  status: string;
  conversations: number;
  leads: number;
  plan: string;
}

const Usage: React.FC = () => {
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [clientUsage, setClientUsage] = useState<ClientUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'conversations' | 'leads' | 'name'>('conversations');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsRes, leadsRes] = await Promise.allSettled([
        adminClientsApi.getAllClients(),
        adminLeadsApi.getLeads({ limit: 1 }),
      ]);

      const clients = clientsRes.status === 'fulfilled' ? (clientsRes.value?.clients || []) : [];
      const totalLeads = leadsRes.status === 'fulfilled' ? (leadsRes.value?.pagination?.total ?? 0) : 0;

      // Fetch conversations for each client
      const convResults = await Promise.allSettled(
        clients.map((c: any) => adminClientsApi.getClientConversations(c.id, { limit: 1 }))
      );

      // Fetch leads per client
      const leadResults = await Promise.allSettled(
        clients.map((c: any) => adminLeadsApi.getLeads({ clientId: c.id, limit: 1 }))
      );

      const usage: ClientUsage[] = clients.map((c: any, i: number) => ({
        id: c.id,
        company_name: c.company_name,
        status: c.status,
        conversations: convResults[i].status === 'fulfilled' ? (convResults[i].value?.pagination?.total_count ?? 0) : 0,
        leads: leadResults[i].status === 'fulfilled' ? (leadResults[i].value?.pagination?.total ?? 0) : 0,
        plan: c.subscription?.plan || '—',
      }));

      const totalConvs = usage.reduce((s, u) => s + u.conversations, 0);
      const avgUsage = clients.length > 0 ? (totalConvs / clients.length).toFixed(1) : '0';

      setStats([
        { icon: 'chat', label: 'Total Conversations', value: totalConvs.toString(), change: 'System-wide', changeType: 'positive', iconColor: 'blue' },
        { icon: 'users', label: 'Total Leads', value: totalLeads.toString(), change: 'All clients', changeType: 'positive', iconColor: 'purple' },
        { icon: 'trending', label: 'Avg per Client', value: avgUsage, change: 'Conversations avg', changeType: 'positive', iconColor: 'green' },
      ]);

      setClientUsage(usage);
    } catch (err) {
      console.error('Usage fetch error:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const filtered = useMemo(() => {
    let data = [...clientUsage];
    if (search) data = data.filter(c => c.company_name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    data.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.company_name.localeCompare(b.company_name) * dir;
      return (a[sortBy] - b[sortBy]) * dir;
    });
    return data;
  }, [clientUsage, search, statusFilter, sortBy, sortDir]);

  const handleSort = (col: 'conversations' | 'leads' | 'name') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const header = 'Company,Status,Conversations,Leads,Plan\n';
    const rows = filtered.map(c => `"${c.company_name}",${c.status},${c.conversations},${c.leads},"${c.plan}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usage-report.csv';
    a.click();
    URL.revokeObjectURL(url);
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
        <h1>Usage & Metrics</h1>
        <p>Monitor resource usage and costs across all clients.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-11 w-11 rounded-lg bg-[var(--color-bg-light)] mb-4" />
                <div className="h-3 w-20 bg-[var(--color-bg-light)] rounded mb-2" />
                <div className="h-6 w-16 bg-[var(--color-bg-light)] rounded" />
              </div>
            ))
          : stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Search by company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
            <div className="tab-filter">
              {(['all', 'active', 'inactive'] as const).map(s => (
                <button key={s} className={`tab-filter-item ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                  {capitalize(s)}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-outline text-small" onClick={exportCSV}>
            <Icon name="download" size="sm" decorative /> Export CSV
          </button>
        </div>
      </div>

      {/* Usage Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('name')}>
                  Company {sortBy === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('conversations')}>
                  Conversations {sortBy === 'conversations' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer" onClick={() => handleSort('leads')}>
                  Leads {sortBy === 'leads' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell">Plan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="table-cell text-center text-[var(--color-text-secondary)]">Loading usage data...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(c => (
                  <tr key={c.id} className="table-row border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="table-cell font-semibold text-[var(--color-text-primary)]">{c.company_name}</td>
                    <td className="table-cell">
                      <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                        {capitalize(c.status)}
                      </span>
                    </td>
                    <td className="table-cell text-[var(--color-text-secondary)]">{c.conversations}</td>
                    <td className="table-cell text-[var(--color-text-secondary)]">{c.leads}</td>
                    <td className="table-cell text-[var(--color-text-secondary)]">{c.plan !== '—' ? capitalize(c.plan) : '—'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="table-cell text-center text-[var(--color-text-secondary)] py-8">No clients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usage;
