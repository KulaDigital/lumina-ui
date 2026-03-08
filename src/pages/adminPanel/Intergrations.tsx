// pages/Integrations.tsx
import React from 'react';
import Icon from '../../components/Icon';
import type { Integration } from '../../types';

const Integrations: React.FC = () => {
    const integrations: Integration[] = [
        { name: 'Stripe', icon: 'card', description: 'Accept payments and manage subscriptions', status: 'Connected', color: 'purple' },
        { name: 'Slack', icon: 'chat', description: 'Send notifications to your team', status: 'Connected', color: 'purple' },
        { name: 'Zapier', icon: 'trending', description: 'Connect with 3000+ apps', status: 'Available', color: 'blue' },
        { name: 'Google Analytics', icon: 'stats', description: 'Track chatbot performance', status: 'Available', color: 'blue' },
        { name: 'Salesforce', icon: 'link', description: 'Sync leads and contacts', status: 'Available', color: 'blue' },
        { name: 'HubSpot', icon: 'analytics', description: 'Marketing automation platform', status: 'Available', color: 'blue' },
    ];

    return (
        <div className="bg-bg-light min-h-screen">
            <div className="mb-8">
                <h1>
                    Integrations
                </h1>
                <p className="text-text-secondary font-body">
                    Connect Kula Chat AI with your favorite tools
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration, index) => (
                    <div key={index} className="bg-white border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-bg-light rounded-md flex items-center justify-center text-text-primary">
                                    <Icon name={integration.icon} size="md" decorative />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary font-heading">{integration.name}</h3>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${integration.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {integration.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary mb-4">{integration.description}</p>
                        <button className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${integration.status === 'Connected'
                            ? 'bg-bg-light text-text-secondary border border-[var(--color-border)] hover:bg-gray-100'
                            : 'bg-primary text-white hover:bg-primary-hover'
                            }`}>
                            {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--color-border)]">
                    <h3 className="text-xl font-bold text-text-primary font-heading">Connected Integrations</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {integrations.filter(i => i.status === 'Connected').map((integration, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-bg-light rounded-md">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-xl border border-[var(--color-border)]">
                                        {integration.icon}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-text-primary">{integration.name}</div>
                                        <div className="text-sm text-text-secondary">Connected 3 days ago</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 text-xs font-medium text-text-secondary border border-[var(--color-border)] rounded-md hover:bg-white transition-colors">
                                        Settings
                                    </button>
                                    <button className="px-3 py-1.5 text-xs font-medium text-status-error border border-status-error/20 rounded-md hover:bg-status-error/5 transition-colors">
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;