import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/instance';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  client_id: string;
  client_name?: string;
  created_at: string;
  updated_at: string;
}

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/support-tickets');
      setTickets(response.data.data || []);
      setLoading(false);
    } catch (_err) {
      // If API fails, show empty state with demo message
      console.error('Failed to fetch tickets:', _err);
      setTickets([]);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredTickets = statusFilter === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === statusFilter);

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-text-primary font-heading text-2xl">
              Support Tickets
            </h1>
            <p className="text-text-secondary font-body text-sm mt-1">
              Manage and respond to customer support tickets
            </p>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-text-primary border border-[var(--color-border)]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === 'open'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-text-primary border border-[var(--color-border)]'
          }`}
        >
          Open
        </button>
        <button
          onClick={() => setStatusFilter('in-progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === 'in-progress'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-text-primary border border-[var(--color-border)]'
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            statusFilter === 'resolved'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-text-primary border border-[var(--color-border)]'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">No tickets available</p>
          <p className="text-text-secondary text-sm mt-2">Support tickets will appear here once they are created</p>
        </div>
      ) : (
        <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <td className="px-6 py-4 text-sm text-text-primary font-medium">
                      {ticket.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {ticket.client_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
