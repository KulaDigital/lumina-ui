// pages/Settings.tsx
import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { SettingsState } from '../../types';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    platformName: 'Kula Chat AI',
    supportEmail: 'support@kulachatai.com',
    emailNotifications: true,
    smsNotifications: false,
    webhookUrl: '',
    apiKey: 'sk-xxxxxxxxxxxxxxxx',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-bg-light min-h-screen">
      <div className="mb-8">
        <h1>Settings</h1>
        <p className="text-text-secondary font-body">Manage your platform settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <h3 className="text-xl font-bold text-text-primary mb-6 font-heading">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Platform Name</label>
              <input
                type="text"
                name="platformName"
                value={settings.platformName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <h3 className="text-xl font-bold text-text-primary mb-6 font-heading">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bg-light rounded-md">
              <div>
                <div className="font-medium text-text-primary">Email Notifications</div>
                <div className="text-sm text-text-secondary">Receive email updates</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-bg-light rounded-md">
              <div>
                <div className="font-medium text-text-primary">SMS Notifications</div>
                <div className="text-sm text-text-secondary">Receive text messages</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <h3 className="text-xl font-bold text-text-primary mb-6 font-heading">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">API Key</label>
              <div className="relative">
                <input
                  type="text"
                  name="apiKey"
                  value={settings.apiKey}
                  readOnly
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md bg-bg-light text-text-secondary"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-primary hover:text-primary-hover">
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Webhook URL</label>
              <input
                type="url"
                name="webhookUrl"
                value={settings.webhookUrl}
                onChange={handleInputChange}
                placeholder="https://your-domain.com/webhook"
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <h3 className="text-xl font-bold text-text-primary mb-6 font-heading">Security</h3>
          <div className="space-y-4">
            <button className="w-full px-4 py-2 text-sm font-medium text-text-secondary border border-[var(--color-border)] rounded-md hover:bg-bg-light transition-colors text-left">
              Change Password
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-text-secondary border border-[var(--color-border)] rounded-md hover:bg-bg-light transition-colors text-left">
              Enable Two-Factor Authentication
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-status-error border border-status-error/20 rounded-md hover:bg-status-error/5 transition-colors text-left">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button className="px-6 py-3 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;