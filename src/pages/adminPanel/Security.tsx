// pages/Security.tsx
import React from 'react';
import type { SecurityLog } from '../../types';

const Security: React.FC = () => {
  const securityLogs: SecurityLog[] = [
    { action: 'Login', user: 'Super Admin', ip: '192.168.1.1', location: 'Chennai, India', time: '2 hours ago', status: 'success' },
    { action: 'Password Changed', user: 'Super Admin', ip: '192.168.1.1', location: 'Chennai, India', time: '1 day ago', status: 'success' },
    { action: 'Failed Login', user: 'Unknown', ip: '103.45.67.89', location: 'Unknown', time: '2 days ago', status: 'failed' },
    { action: 'API Key Generated', user: 'Super Admin', ip: '192.168.1.1', location: 'Chennai, India', time: '3 days ago', status: 'success' },
  ];

  return (
    <div className="bg-light min-h-screen">
      <div className="mb-8">
        <h1>Security</h1>
        <p className="text-text-secondary font-body">Monitor security events and manage access controls</p>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-md flex items-center justify-center text-2xl">✓</div>
            <div>
              <div className="text-2xl font-bold text-text-primary font-heading">1,247</div>
              <div className="text-sm text-text-secondary">Successful Logins</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-md flex items-center justify-center text-2xl">✗</div>
            <div>
              <div className="text-2xl font-bold text-text-primary font-heading">3</div>
              <div className="text-sm text-text-secondary">Failed Attempts</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center text-2xl">🔑</div>
            <div>
              <div className="text-2xl font-bold text-text-primary font-heading">12</div>
              <div className="text-sm text-text-secondary">Active Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Two-Factor Authentication */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-text-primary font-heading mb-1">Two-Factor Authentication</h3>
              <p className="text-sm text-text-secondary">Add an extra layer of security to your account</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Enabled
            </span>
          </div>
          <button className="w-full px-4 py-2 text-sm font-medium text-text-secondary border border-[var(--color-border)] rounded-md hover:bg-bg-light transition-colors">
            Configure 2FA
          </button>
        </div>

        {/* Session Management */}
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-text-primary font-heading mb-1">Active Sessions</h3>
              <p className="text-sm text-text-secondary">Manage your active sessions across devices</p>
            </div>
          </div>
          <button className="w-full px-4 py-2 text-sm font-medium text-status-error border border-status-error/20 rounded-md hover:bg-status-error/5 transition-colors">
            Revoke All Sessions
          </button>
        </div>
      </div>

      {/* Security Logs */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary font-heading">Security Activity Log</h3>
          <button className="px-4 py-2 text-sm font-medium text-text-secondary border border-[var(--color-border)] rounded-md hover:bg-bg-light transition-colors">
            Export Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-light border-b border-[var(--color-border)]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {securityLogs.map((log, index) => (
                <tr key={index} className="hover:bg-bg-light transition-colors">
                  <td className="px-6 py-4"><span className="font-semibold text-text-primary">{log.action}</span></td>
                  <td className="px-6 py-4 text-text-secondary">{log.user}</td>
                  <td className="px-6 py-4 text-text-secondary font-mono text-sm">{log.ip}</td>
                  <td className="px-6 py-4 text-text-secondary">{log.location}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{log.time}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status === 'success' ? '✓ Success' : '✗ Failed'}
                    </span>
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

export default Security;