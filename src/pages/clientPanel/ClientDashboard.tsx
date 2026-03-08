import React, { useState, useEffect } from 'react';
import { clientApi, fetchScraperData } from '../../api';
import StatCard from '../../components/StatCard';
import Icon from '../../components/Icon';
import type { StatCardProps } from '../../types';

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  path: string;
}

interface SubscriptionData {
  plan: string;
  period: string;
  status: string;
  is_trial: boolean;
  started_at: string;
  ends_at: string;
}

const ClientDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCardProps[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  const quickActions: QuickAction[] = [
    { icon: 'chatbot', label: 'Create Chatbot', description: 'Build a new AI chatbot', path: '/client/chatbot' },
    { icon: 'chat', label: 'View Conversations', description: 'Check recent conversations', path: '/client/conversations' },
    { icon: 'settings', label: 'Configuration', description: 'Adjust chatbot settings', path: '/client/chatbot-config' },
    { icon: 'analytics', label: 'Analytics', description: 'View performance metrics', path: '/client/analytics' },
  ];

  useEffect(() => {
    fetchClientStats();
    fetchSubscriptionDataFn();
  }, []);

  const fetchSubscriptionDataFn = async () => {
    try {
      const response = await clientApi.getClientProfile();
      if (response.subscription) {
        setSubscription(response.subscription);
      }
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    }
  };

  const fetchClientStats = async () => {
    try {
      const { content, stats } = await fetchScraperData();
      const contentList = content.content || [];
      const statsData = stats || {};
      
      const totalUrls = statsData.totalUrls || contentList.length;
      const totalChunks = statsData.totalChunks || 0;
      const totalWords = statsData.totalWords || 0;
      const averageWordsPerChunk = statsData.averageWordsPerChunk || 0;
      const averageChunksPerUrl = statsData.averageChunksPerUrl || 0;
      
      setStats([
        {
          icon: 'search',
          label: 'Scraped URLs',
          value: totalUrls.toString(),
          change: totalChunks > 0 ? `${totalChunks} chunks indexed` : 'No content indexed',
          changeType: totalUrls > 0 ? 'positive' : 'negative',
          iconColor: 'purple',
        },
        {
          icon: 'analytics',
          label: 'Total Chunks',
          value: totalChunks.toString(),
          change: `${averageChunksPerUrl?.toFixed(1) || '0'} avg per URL`,
          changeType: totalChunks > 0 ? 'positive' : 'negative',
          iconColor: 'blue',
        },
        {
          icon: 'book',
          label: 'Total Words',
          value: totalWords >= 1000 ? `${(totalWords / 1000).toFixed(1)}K` : totalWords.toString(),
          change: `${averageWordsPerChunk?.toFixed(0) || '0'} avg per chunk`,
          changeType: totalWords > 0 ? 'positive' : 'negative',
          iconColor: 'orange',
        },
        {
          icon: 'trending',
          label: 'Knowledge Base',
          value: totalUrls > 0 ? 'Ready' : 'Empty',
          change: totalUrls > 0 ? 'Ready to use' : 'Add content',
          changeType: totalUrls > 0 ? 'positive' : 'negative',
          iconColor: 'green',
        },
      ]);
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status: number; data?: { error: string } } };
        if (error.response?.status === 403) {
          console.warn('Access denied to scraper data:', error.response.data?.error);
        }
      } else {
        console.error('Error fetching client stats:', err);
      }
      setStats(getFallbackStats());
    }
  };

  const getFallbackStats = (): StatCardProps[] => [
    { icon: 'search', label: 'Scraped URLs', value: '0', change: 'No content indexed', changeType: 'negative', iconColor: 'purple' },
    { icon: 'analytics', label: 'Total Chunks', value: '0', change: '0 avg per URL', changeType: 'negative', iconColor: 'blue' },
    { icon: 'book', label: 'Total Words', value: '0', change: '0 avg per chunk', changeType: 'negative', iconColor: 'orange' },
    { icon: 'trending', label: 'Knowledge Base', value: 'Empty', change: 'Add content', changeType: 'negative', iconColor: 'green' },
  ];

  const getSubscriptionBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'professional': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'business': return 'bg-green-50 border-green-200 text-green-700';
      case 'enterprise': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getShortPlanName = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'professional': return 'Professional';
      case 'business': return 'Business';
      case 'enterprise': return 'Enterprise';
      default: return 'Plan';
    }
  };

  const formatPlanName = (plan: string, isTrial: boolean) => {
    const planName = getShortPlanName(plan);
    return isTrial ? `${planName} (Trial)` : planName;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Page Header */}
      <div className="page-header">
        <h1>Welcome Back!</h1>
        <p>Here's an overview of your chatbot performance and usage.</p>
      </div>

      {/* Subscription Card */}
      {subscription && (
        <div className={`border rounded-lg p-5 ${getSubscriptionBadgeColor(subscription.plan)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold">{formatPlanName(subscription.plan, subscription.is_trial)} Plan</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getSubscriptionBadgeColor(subscription.plan)}`}>
                  {subscription.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm opacity-75">
                {subscription.period && `Billed ${subscription.period}`}
                {subscription.ends_at && ` · Renews ${formatDate(subscription.ends_at)}`}
              </p>
            </div>
            <Icon name="subscription" size="xl" decorative className="opacity-30" />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.length > 0 ? stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        )) : getFallbackStats().map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-h2 text-[var(--color-text-primary)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <div 
              key={index}
              onClick={() => window.location.href = action.path}
              className="card p-5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-[var(--transition-base)]">
                <Icon name={action.icon} size="md" decorative />
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{action.label}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Updates Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-h3 text-[var(--color-text-primary)]">Recent Updates</h3>
        </div>
        <div className="card-body space-y-3">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Icon name="info" size="md" decorative className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[var(--color-text-primary)] text-sm">Getting Started</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Create your first chatbot and configure it to handle customer inquiries.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
            <Icon name="check" size="md" decorative className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[var(--color-text-primary)] text-sm">Monitor Performance</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Track conversations and analytics to optimize your chatbot's responses.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <Icon name="link" size="md" decorative className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[var(--color-text-primary)] text-sm">Integrate & Deploy</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Connect your chatbot to your website or application using our APIs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
