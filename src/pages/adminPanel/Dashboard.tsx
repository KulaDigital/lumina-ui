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
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity Card */}
      <div className="card">
        {/* Card Header */}
        <div className="card-header">
          <h3 className="text-h3 text-[var(--color-text-primary)]">
            Recent Client Activity
          </h3>
          <button className="btn btn-outline text-sm">
            View All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--color-bg-light)] border-b border-[var(--color-border)]">
                <th className="table-header-cell">Client Name</th>
                <th className="table-header-cell">Action</th>
                <th className="table-header-cell">Plan</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {recentActivity.map((activity, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">
                    <span className="font-semibold text-[var(--color-text-primary)]">{activity.client}</span>
                  </td>
                  <td className="table-cell text-[var(--color-text-secondary)]">{activity.action}</td>
                  <td className="table-cell text-[var(--color-text-secondary)]">{activity.plan}</td>
                  <td className="table-cell">
                    <span className={`badge ${activity.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="table-cell text-[var(--color-text-secondary)] text-sm">{activity.date}</td>
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
