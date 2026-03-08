// pages/Chatbots.tsx
import React from 'react';
import StatCard from '../../components/StatCard';
import type { Chatbot, StatCardProps } from '../../types';

const Chatbots: React.FC = () => {
  const stats: StatCardProps[] = [
    { icon: 'chatbot', label: 'Total Chatbots', value: '127' },
    { icon: 'trending', label: 'Active Now', value: '89' },
    { icon: 'stats', label: 'Avg. Accuracy', value: '96%' },
  ];

  const chatbots: Chatbot[] = [
    { name: 'Support Bot', client: 'Acme Corporation', model: 'GPT-4', conversations: '12,543', status: 'Active' },
    { name: 'Sales Assistant', client: 'TechStart Inc', model: 'GPT-3.5', conversations: '3,201', status: 'Active' },
    { name: 'HR Helper', client: 'Global Solutions', model: 'GPT-4', conversations: '8,762', status: 'Active' },
    { name: 'Customer Care', client: 'Digital Hub', model: 'GPT-3.5', conversations: '1,456', status: 'Active' },
  ];

  return (
    <div className="bg-bg-light min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1>
          Chatbot Management
        </h1>
        <p className="text-text-secondary font-body">
          Monitor and manage all chatbots across all clients
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Chatbots Table Card */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-bold text-text-primary font-heading">
            All Chatbots
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-light border-b border-[var(--color-border)]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Chatbot Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Conversations
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {chatbots.map((bot, index) => (
                <tr key={index} className="hover:bg-bg-light transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-text-primary">{bot.name}</span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{bot.client}</td>
                  <td className="px-6 py-4 text-text-secondary">{bot.model}</td>
                  <td className="px-6 py-4 text-text-secondary">{bot.conversations}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {bot.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-[var(--color-border)] rounded-md hover:bg-bg-light transition-colors">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Chatbots;