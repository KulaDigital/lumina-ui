import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/instance';
import { useNotification } from '../../components/Notification';

interface Lead {
  id: number;
  client_id: number;
  visitor_id: string;
  conversation_id: number | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const Leads: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'qualified' | 'won' | 'lost'>('all');
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const LIMIT = 20;

  useEffect(() => {
    fetchLeads();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * LIMIT;
      let query = `/leads?limit=${LIMIT}&offset=${offset}`;

      if (searchQuery.trim()) {
        query += `&q=${encodeURIComponent(searchQuery)}`;
      }

      const response = await axiosInstance.get(query);

      if (response.data.success) {
        let filteredLeads = response.data.items || [];

        // Client-side filtering for status
        if (statusFilter !== 'all') {
          filteredLeads = filteredLeads.filter((lead: Lead) => lead.status === statusFilter);
        }

        setLeads(filteredLeads);

        // Calculate pagination
        const total = response.data.total || 0;
        const totalPages = Math.ceil(total / LIMIT);

        setPagination({
          total,
          limit: LIMIT,
          offset,
          currentPage,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrevious: currentPage > 1,
        });
      } else {
        setError('Failed to load leads');
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status: number; data?: { message: string } } };
        if (error.response?.status === 403) {
          setError('You do not have access to view leads.');
        } else {
          setError(error.response?.data?.message || 'Failed to load leads');
        }
      } else {
        setError('Failed to load leads. Please try again.');
      }
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: number, visitorId: string, newStatus: string) => {
    try {
      setUpdatingStatusId(leadId);

      const response = await axiosInstance.put(`/leads/${visitorId}/status`, {
        status: newStatus,
      });

      if (response.data.success) {
        // Update local state
        setLeads(
          leads.map((lead) =>
            lead.id === leadId ? { ...lead, status: newStatus as any } : lead
          )
        );
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
      showNotification('Failed to update lead status. Please try again.', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      qualified: 'bg-green-100 text-green-700 border-green-200',
      won: 'bg-green-100 text-green-700 border-green-200',
      lost: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: any) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-text-primary font-heading text-3xl font-bold">
          Leads
        </h1>
        <p className="text-text-secondary font-body text-sm mt-1">
          Manage and track your captured leads
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-5">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {!loading && leads.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-text-secondary text-sm font-medium">Total Leads</p>
            <p className="text-3xl font-bold text-text-primary mt-2">{pagination?.total || 0}</p>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-blue-600 text-sm font-medium">New</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {leads.filter((l) => l.status === 'new').length}
            </p>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-green-600 text-sm font-medium">Qualified</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {leads.filter((l) => l.status === 'qualified').length}
            </p>
          </div>
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
            <p className="text-green-600 text-sm font-medium">Won</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {leads.filter((l) => l.status === 'won').length}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-4">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-text-primary placeholder-text-secondary"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Filter by Status
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilterChange('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'new'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              New
            </button>
            <button
              onClick={() => handleStatusFilterChange('contacted')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'contacted'
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Contacted
            </button>
            <button
              onClick={() => handleStatusFilterChange('qualified')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'qualified'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Qualified
            </button>
            <button
              onClick={() => handleStatusFilterChange('won')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'won'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Won
            </button>
            <button
              onClick={() => handleStatusFilterChange('lost')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'lost'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Lost
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-text-secondary text-sm">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <p className="text-text-primary font-medium mb-2">No leads found</p>
              <p className="text-text-secondary text-sm">
                {searchQuery ? 'Try adjusting your search criteria' : 'Leads captured from your chatbot will appear here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead>
                <tr className="bg-bg-light border-b border-[var(--color-border)]">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Name
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Email
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Phone
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Company
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Status
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Captured On
                    </span>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[var(--color-border)] hover:bg-bg-light transition-colors"
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-primary">
                        {lead.name}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {lead.email}
                      </a>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-text-secondary">—</span>
                      )}
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {lead.company || '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, lead.visitor_id, e.target.value)}
                          disabled={updatingStatusId === lead.id}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${getStatusBadgeColor(lead.status)} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {formatDate(lead.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination */}
        {!loading && leads.length > 0 && pagination && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-bg-light flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">
              Showing{' '}
              <span className="font-semibold">
                {pagination.offset + 1}-{Math.min(pagination.offset + LIMIT, pagination.total)}
              </span>{' '}
              of <span className="font-semibold">{pagination.total}</span> leads
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevious}
                className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                title="Previous page"
              >
                ←
              </button>

              <div className="px-3 py-1 bg-white rounded border border-gray-200 text-center">
                <span className="text-sm font-semibold text-gray-700">
                  {pagination.currentPage}/{pagination.totalPages}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="inline-flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                title="Next page"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
      {NotificationComponent}
    </div>
  );
};

export default Leads;
