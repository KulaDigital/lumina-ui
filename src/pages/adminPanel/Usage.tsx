// pages/Usage.tsx
import React from 'react';
import StatCard from '../../components/StatCard';
import type { StatCardProps, Usage as UsageType } from '../../types';

const Usage: React.FC = () => {
  const stats: StatCardProps[] = [
    { icon: 'api', label: 'API Calls This Month', value: '1.2M', change: '↑ 15% from last month', changeType: 'positive' },
    { icon: 'storage', label: 'Storage Used', value: '24.5 GB', change: '↑ 2.1 GB increase', changeType: 'positive' },
    { icon: 'trending', label: 'Bandwidth', value: '450 GB', change: '↑ 12% from last month', changeType: 'positive' },
  ];

  const usageData: UsageType[] = [
    { client: 'Acme Corporation', apiCalls: '450,234', storage: '8.2 GB', bandwidth: '120 GB', cost: '$234' },
    { client: 'TechStart Inc', apiCalls: '280,567', storage: '5.1 GB', bandwidth: '95 GB', cost: '$156' },
    { client: 'Global Solutions', apiCalls: '320,891', storage: '6.8 GB', bandwidth: '110 GB', cost: '$198' },
    { client: 'Digital Hub', apiCalls: '150,432', storage: '4.4 GB', bandwidth: '125 GB', cost: '$87' },
  ];

  return (
    <div className="bg-bg-light min-h-screen">
      <div className="mb-8">
        <h1>
          Usage & Billing
        </h1>
        <p className="text-text-secondary font-body">
          Monitor resource usage and costs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-bold text-text-primary font-heading">
            Client Usage Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-light border-b border-[var(--color-border)]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">API Calls</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Bandwidth</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {usageData.map((usage, index) => (
                <tr key={index} className="hover:bg-bg-light transition-colors">
                  <td className="px-6 py-4"><span className="font-semibold text-text-primary">{usage.client}</span></td>
                  <td className="px-6 py-4 text-text-secondary">{usage.apiCalls}</td>
                  <td className="px-6 py-4 text-text-secondary">{usage.storage}</td>
                  <td className="px-6 py-4 text-text-secondary">{usage.bandwidth}</td>
                  <td className="px-6 py-4 text-text-primary font-semibold">{usage.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white border border-[var(--color-border)] rounded-lg p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4 font-heading">
          API Usage Trends
        </h3>
        <div className="h-80 bg-bg-light rounded-md flex items-center justify-center text-text-secondary">
          📊 Area Chart - API Calls Over Time
        </div>
      </div>
    </div>
  );
};

export default Usage;