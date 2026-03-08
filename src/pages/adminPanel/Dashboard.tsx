// pages/Dashboard.tsx
import React from 'react';
import StatCard from '../../components/StatCard';
import type { Activity, StatCardProps } from '../../types';

const Dashboard: React.FC = () => {
  const stats: StatCardProps[] = [
    { icon: 'people', label: 'Total Clients', value: '42', change: '↑ 12% from last month', changeType: 'positive', iconColor: 'blue' },
    { icon: 'chatbot', label: 'Active Chatbots', value: '127', change: '↑ 8% from last month', changeType: 'positive', iconColor: 'purple' },
    { icon: 'billing', label: 'Monthly Revenue', value: '$12,450', change: '↑ 23% from last month', changeType: 'positive', iconColor: 'green' },
    { icon: 'chat', label: 'Total Conversations', value: '45.2K', change: '↑ 34% from last month', changeType: 'positive', iconColor: 'orange' },
  ];

  const recentActivity: Activity[] = [
    { client: 'Acme Corporation', action: 'Created new chatbot', plan: 'Enterprise', status: 'Active', date: '2 hours ago' },
    { client: 'TechStart Inc', action: 'Upgraded plan', plan: 'Professional', status: 'Active', date: '5 hours ago' },
    { client: 'Global Solutions', action: 'Renewed subscription', plan: 'Enterprise', status: 'Active', date: 'Yesterday' },
    { client: 'Digital Hub', action: 'Payment failed', plan: 'Business', status: 'Pending', date: '2 days ago' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1>
          Dashboard Overview
        </h1>
        <p className="text-text-secondary font-body">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary font-heading">
            Recent Client Activity
          </h3>
          <button className="px-4 py-2 text-sm font-medium text-text-secondary border border-[var(--color-border)] rounded-md hover:bg-bg-light transition-colors">
            View All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-light border-b border-[var(--color-border)]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {recentActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-bg-light transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-text-primary">{activity.client}</span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{activity.action}</td>
                  <td className="px-6 py-4 text-text-secondary">{activity.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${activity.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;