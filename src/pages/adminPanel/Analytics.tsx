// pages/Analytics.tsx
import React from 'react';
import StatCard from '../../components/StatCard';
import type { StatCardProps } from '../../types';

const Analytics: React.FC = () => {
    const stats: StatCardProps[] = [
        { icon: 'search', label: 'Total Views', value: '124.5K', change: '↑ 18% from last month', changeType: 'positive', iconColor: 'blue' },
        { icon: 'chat', label: 'Conversations', value: '45.2K', change: '↑ 34% from last month', changeType: 'positive', iconColor: 'purple' },
        { icon: 'trending', label: 'Avg. Rating', value: '4.8', change: '↑ 0.2 improvement', changeType: 'positive', iconColor: 'orange' },
        { icon: 'stats', label: 'Response Time', value: '1.2s', change: '↓ 0.3s faster', changeType: 'positive', iconColor: 'green' },
    ];

    return (
        <div className="bg-bg-light min-h-screen">
            {/* Page Header */}
            <div className="mb-8">
                <h1>
                    Analytics Dashboard
                </h1>
                <p className="text-text-secondary font-body">
                    Track performance metrics and insights
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1 - Conversations Over Time */}
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4 font-heading">
                        Conversations Over Time
                    </h3>
                    <div className="h-64 bg-bg-light rounded-md flex items-center justify-center text-text-secondary">
                        📊 Line Chart Placeholder
                    </div>
                </div>

                {/* Chart 2 - Client Distribution */}
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4 font-heading">
                        Client Distribution
                    </h3>
                    <div className="h-64 bg-bg-light rounded-md flex items-center justify-center text-text-secondary">
                        🥧 Pie Chart Placeholder
                    </div>
                </div>

                {/* Chart 3 - Response Time Trends */}
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4 font-heading">
                        Response Time Trends
                    </h3>
                    <div className="h-64 bg-bg-light rounded-md flex items-center justify-center text-text-secondary">
                        📈 Area Chart Placeholder
                    </div>
                </div>

                {/* Chart 4 - Top Performing Chatbots */}
                <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4 font-heading">
                        Top Performing Chatbots
                    </h3>
                    <div className="h-64 bg-bg-light rounded-md flex items-center justify-center text-text-secondary">
                        📊 Bar Chart Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;