import React, { useEffect, useState } from 'react';
import { adminClientsApi } from '../../api';
import axiosInstance from '../../utils/instance';
import publicAxios from '../../utils/publicInstance';
import Drawer from '../../components/Drawer';
import AddClient from './AddClient';
import Button from '../../components/Button';
import ViewModal from '../../components/ViewModal';
import EditModal from '../../components/EditModal';
import DeleteModal from '../../components/DeleteModal';
import StarterSuggestions from '../../components/StarterSuggestions';
import { useNotification } from '../../components/Notification';

interface ClientData {
  id: number;
  company_name: string;
  website_url: string;
  status: string;
  created_at: string;
  api_key?: string;
  widget_config?: any;
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  position?: string;
  embed_script?: string;
  starter_suggestions?: string[] | null;
}

const Clients: React.FC = () => {
  const { showNotification, NotificationComponent } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  
  // Modal states
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ClientData>>({});
  const [editStarterSuggestions, setEditStarterSuggestions] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Rescrape/Re-embed progress states
  const [rescrapeProgress, setRescrapeProgress] = useState<{
    isProcessing: boolean;
    progress: number;
    status: string;
    error: string | null;
    clientId: number | null;
  }>({
    isProcessing: false,
    progress: 0,
    status: '',
    error: null,
    clientId: null,
  });

  const fetchClients = async (status: 'active' | 'inactive') => {
    try {
      setLoading(true);
      const response = await adminClientsApi.getClientsByStatus(status);
      if (response.success) {
        setClients(response.clients);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(statusFilter);
  }, [statusFilter]);

  const getStatusBadge = (status: string): string => {
    const classes: Record<string, string> = {
      'active': 'bg-green-100 text-green-700',
      'inactive': 'bg-red-100 text-red-700',
      'trial': 'bg-yellow-100 text-yellow-700',
    };
    return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const handleAddClient = () => {
    setIsOpen(true);
  };

  const handleClientAdded = () => {
    setIsOpen(false);
    fetchClients(statusFilter);
  };

  const handleViewClient = async (client: ClientData) => {
    try {
      // Fetch full client details including embed_script
      const response = await adminClientsApi.getClient(client.id);
      if (response.success) {
        setSelectedClient({
          ...client,
          embed_script: response.client.embed_script
        });
      } else {
        setSelectedClient(client);
      }
    } catch (err) {
      console.error('Error fetching client details:', err);
      setSelectedClient(client);
    }
    setViewModal(true);
  };

  const handleEditClient = (client: ClientData) => {
    setSelectedClient(client);
    // Extract colors from widget_config into flat form fields
    setEditFormData({
      ...client,
      primaryColor: client.widget_config?.primaryColor || '#635BFF',
      secondaryColor: client.widget_config?.secondaryColor || '#0A2540',
      welcomeMessage: client.widget_config?.welcomeMessage || '',
      position: client.widget_config?.position || 'bottom-right',
    });
    setEditStarterSuggestions(
      Array.isArray(client.starter_suggestions) ? client.starter_suggestions : []
    );
    setEditModal(true);
  };

  const handleDeleteClient = (client: ClientData) => {
    setSelectedClient(client);
    setDeleteModal(true);
  };

  const handleActivateClient = async (client: ClientData) => {
    try {
      const response = await axiosInstance.put(`/admin/clients/${client.id}`, {
        status: 'active'
      });

      if (response.data.success) {
        showNotification('Client activated successfully!', 'success');
        setViewModal(false);
        fetchClients(statusFilter);
      }
    } catch (err: any) {
      console.error('Error activating client:', err);
      showNotification(err.response?.data?.error || 'Failed to activate client', 'error');
    }
  };

  const handleRescrapeAndReembed = async (client: ClientData) => {
    try {
      if (!confirm(`Are you sure you want to rescrape and re-embed content for ${client.company_name}? This may take a few minutes.`)) {
        return;
      }

      // Close the modal immediately
      setViewModal(false);

      setRescrapeProgress({
        isProcessing: true,
        progress: 10,
        status: 'Starting rescrape process...',
        error: null,
        clientId: client.id,
      });

      // First, rescrape the domain
      const scrapeResponse = await publicAxios.post(
        "/scraper/crawl-domain",
        { websiteUrl: client.website_url },
        { headers: { "x-api-key": client.api_key } }
      );

      if (scrapeResponse.data.jobId) {
        console.log('Domain rescrape started with jobId:', scrapeResponse.data.jobId);
        
        setRescrapeProgress({
          isProcessing: true,
          progress: 30,
          status: 'Scraping website content...',
          error: null,
          clientId: client.id,
        });

        // Poll for scraping completion
        if (client.api_key) {
          monitorRescrapeProgress(scrapeResponse.data.jobId, client.api_key, client.id);
        }
      }
    } catch (err: any) {
      console.error('Error restarting rescrape and re-embed:', err);
      setRescrapeProgress({
        isProcessing: false,
        progress: 0,
        status: '',
        error: err.response?.data?.error || 'Failed to start rescraping',
        clientId: null,
      });
      showNotification(err.response?.data?.error || 'Failed to start rescraping and re-embedding', 'error');
    }
  };

  const monitorRescrapeProgress = (jobId: string, apiKey: string, clientId: number) => {
    let attempts = 0;
    const maxAttempts = 600; // 10 minutes with 1-second intervals
    
    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await publicAxios.get(`/scraper/job/${jobId}?client_id=${clientId}`, {
          headers: { 'x-api-key': apiKey }
        });

        console.log('[monitorRescrapeProgress] Job status:', response.data);

        if (response.data.status === 'completed') {
          clearInterval(pollInterval);
          
          setRescrapeProgress({
            isProcessing: true,
            progress: 70,
            status: 'Scraping complete. Generating embeddings...',
            error: null,
            clientId,
          });

          // Now trigger embeddings
          triggerReembedding(apiKey, clientId);
        } else if (response.data.status === 'running' || response.data.status === 'pending') {
          const percentage = response.data.progress?.percentage || 0;
          const currentProgress = 30 + percentage * 0.4; // Scale 0-100 to 30-70
          setRescrapeProgress({
            isProcessing: true,
            progress: Math.min(currentProgress, 65),
            status: `Scraping: ${percentage}%`,
            error: null,
            clientId,
          });
        } else if (response.data.status === 'failed') {
          clearInterval(pollInterval);
          setRescrapeProgress({
            isProcessing: false,
            progress: 0,
            status: '',
            error: response.data.error || 'Scraping failed',
            clientId: null,
          });
          showNotification(response.data.error || 'Scraping failed', 'error');
        }
      } catch (err) {
        console.error('[monitorRescrapeProgress] Error:', err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setRescrapeProgress({
          isProcessing: false,
          progress: 0,
          status: '',
          error: 'Rescraping timeout - please try again',
          clientId: null,
        });
        showNotification('Rescraping timeout - please try again', 'error');
      }
    }, 1000);
  };

  const triggerReembedding = async (apiKey: string, clientId: number) => {
    try {
      const response = await publicAxios.post(
        "/embeddings/generate",
        {},
        { headers: { 'x-api-key': apiKey } }
      );

      console.log('[triggerReembedding] Embeddings response:', response.data);

      if (response.data.success && response.data.jobId) {
        // Async job started — monitor via job endpoint
        monitorReembeddingProgress(response.data.jobId, apiKey, clientId);
      } else if (response.data.success && response.data.pendingCount === 0) {
        // All chunks already embedded
        setRescrapeProgress({
          isProcessing: false,
          progress: 100,
          status: 'Rescraping and re-embedding complete!',
          error: null,
          clientId: null,
        });
        setTimeout(() => {
          showNotification('Rescraping and re-embedding completed successfully!', 'success');
          fetchClients(statusFilter);
        }, 800);
      } else {
        setRescrapeProgress({
          isProcessing: false,
          progress: 0,
          status: '',
          error: response.data.error || 'Failed to start embedding generation',
          clientId: null,
        });
        showNotification(response.data.error || 'Failed to start embedding generation', 'error');
      }
    } catch (err: any) {
      console.error('[triggerReembedding] Error:', err);
      setRescrapeProgress({
        isProcessing: false,
        progress: 0,
        status: '',
        error: err.response?.data?.error || 'Failed to generate embeddings',
        clientId: null,
      });
      showNotification(err.response?.data?.error || 'Failed to generate embeddings', 'error');
    }
  };

  const monitorReembeddingProgress = (jobId: number, apiKey: string, clientId: number) => {
    let attempts = 0;
    const maxAttempts = 360; // 6 minutes with 1-second intervals

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        const response = await publicAxios.get(`/embeddings/job/${jobId}`, {
          headers: { 'x-api-key': apiKey }
        });

        console.log('[monitorReembeddingProgress] Job status:', response.data);

        const { status, progress, error: jobError } = response.data;

        if (status === 'completed') {
          clearInterval(pollInterval);
          setRescrapeProgress({
            isProcessing: false,
            progress: 100,
            status: 'Rescraping and re-embedding complete!',
            error: null,
            clientId: null,
          });
          // Delay notification and refresh to let progress bar animate to 100%
          setTimeout(() => {
            showNotification('Rescraping and re-embedding completed successfully!', 'success');
            fetchClients(statusFilter);
          }, 800);
        } else if (status === 'failed') {
          clearInterval(pollInterval);
          setRescrapeProgress({
            isProcessing: false,
            progress: 0,
            status: '',
            error: jobError || 'Embedding generation failed',
            clientId: null,
          });
          showNotification(jobError || 'Embedding generation failed', 'error');
        } else {
          const percentage = progress?.percentage || 0;
          const currentProgress = 70 + percentage * 0.3;
          setRescrapeProgress({
            isProcessing: true,
            progress: Math.min(currentProgress, 95),
            status: `Re-embedding: ${percentage}%`,
            error: null,
            clientId,
          });
        }
      } catch (err) {
        console.error('[monitorReembeddingProgress] Error:', err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setRescrapeProgress({
          isProcessing: false,
          progress: 0,
          status: '',
          error: 'Re-embedding timeout - please try again',
          clientId: null,
        });
        showNotification('Re-embedding timeout - please try again', 'error');
      }
    }, 1000);
  };

  const handleEditSubmit = async () => {
    if (!selectedClient) return;

    try {
      setEditLoading(true);
      const payload = {
        company_name: editFormData.company_name || selectedClient.company_name,
        website_url: editFormData.website_url || selectedClient.website_url,
        status: editFormData.status || selectedClient.status,
        widget_config: {
          ...(selectedClient.widget_config || {}),
          primaryColor: editFormData.primaryColor || selectedClient.widget_config?.primaryColor || '#635BFF',
          secondaryColor: editFormData.secondaryColor || selectedClient.widget_config?.secondaryColor || '#0A2540',
          welcomeMessage: editFormData.welcomeMessage !== undefined ? editFormData.welcomeMessage : (selectedClient.widget_config?.welcomeMessage || ''),
          position: editFormData.position || selectedClient.widget_config?.position || 'bottom-right',
        },
        starter_suggestions: editStarterSuggestions.length > 0 ? editStarterSuggestions : null,
      };

      const response = await axiosInstance.put(`/admin/clients/${selectedClient.id}`, payload);

      if (response.data.success) {
        showNotification('Client updated successfully!', 'success');
        setEditModal(false);
        fetchClients(statusFilter);
      }
    } catch (err: any) {
      console.error('Error updating client:', err);
      showNotification(err.response?.data?.error || 'Failed to update client', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedClient) return;

    try {
      setDeleteLoading(true);
      const response = await axiosInstance.delete(`/admin/clients/${selectedClient.id}`);

      if (response.data.success) {
        showNotification('Client deactivated successfully!', 'success');
        setDeleteModal(false);
        fetchClients(statusFilter);
      }
    } catch (err: any) {
      console.error('Error deleting client:', err);
      showNotification(err.response?.data?.error || 'Failed to delete client', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-bg-light min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>
            Client Management
          </h1>
          <p className="text-text-secondary font-body">
            Manage all your clients and their subscriptions
          </p>
        </div>
      </div>

      {/* Clients Table Card */}
      <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-xl font-bold text-text-primary font-heading">
            All Clients
          </h3>
          <Button 
            onClick={handleAddClient}
            label="+ Add Client"
          />
        </div>

        {/* Status Tabs */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex gap-4">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'active'
                ? 'text-white'
                : 'bg-bg-light text-text-secondary hover:bg-gray-200'
            }`}
            style={statusFilter === 'active' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            Active Clients
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'text-white'
                : 'bg-bg-light text-text-secondary hover:bg-gray-200'
            }`}
            style={statusFilter === 'inactive' ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            Inactive Clients
          </button>
        </div>

        {/* Progress Bar - Rescrape/Re-embed */}
        {rescrapeProgress.isProcessing && (
          <div className="mt-6 mb-6 px-6">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{rescrapeProgress.status}</span>
                <span className="text-sm font-medium text-gray-600">{rescrapeProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${rescrapeProgress.progress}%` }}
                />
              </div>
              {rescrapeProgress.error && (
                <div className="mt-3 p-2 rounded bg-red-100 border border-red-300 text-red-700 text-sm font-medium">
                  ⚠️ Error: {rescrapeProgress.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-text-secondary">Loading clients...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-center text-text-secondary">
              No {statusFilter} clients found.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-bg-light border-b border-[var(--color-border)]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-bg-light transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-text-primary">{client.company_name}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{client.website_url}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(client.status)}`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleViewClient(client)}
                        className="px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-light)] transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleRescrapeAndReembed(client)}
                        disabled={statusFilter === 'inactive'}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                          statusFilter === 'inactive'
                            ? 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed pointer-events-none'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                        title="Rescrape website content and regenerate embeddings"
                      >
                        Rescrape
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        disabled={statusFilter === 'inactive'}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                          statusFilter === 'inactive'
                            ? 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed pointer-events-none'
                            : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client)}
                        disabled={statusFilter === 'inactive'}
                        className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
                          statusFilter === 'inactive'
                            ? 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed pointer-events-none'
                            : 'text-[var(--color-error)] border-[var(--color-error)] hover:bg-red-50'
                        }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Drawer open={isOpen} close={() => setIsOpen(false)}>
          <AddClient close={handleClientAdded} />
        </Drawer>
      </div>

      {/* VIEW MODAL */}
      <ViewModal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Client Details"
        fields={selectedClient ? [
          { label: 'Company Name', value: selectedClient.company_name },
          { label: 'Website', value: selectedClient.website_url },
          { label: 'Status', value: selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1), isBadge: true, badgeClass: getStatusBadge(selectedClient.status) },
          { label: 'Created Date', value: new Date(selectedClient.created_at).toLocaleString() },
          ...(selectedClient.status === 'active' && selectedClient.embed_script ? [{ label: 'Embed Script', value: selectedClient.embed_script, isScript: true }] : []),
        ] : []}
        actions={selectedClient ? (
          selectedClient.status === 'inactive' 
            ? [
                {
                  label: 'Activate Client',
                  onClick: () => handleActivateClient(selectedClient),
                  color: 'var(--color-primary)',
                }
              ]
            : [
                {
                  label: 'Rescrape & Re-embed',
                  onClick: () => handleRescrapeAndReembed(selectedClient),
                  color: 'var(--color-success)',
                },
              ]
        ) : undefined}
      />

      {/* EDIT MODAL */}
      <EditModal
        open={editModal}
        onClose={() => setEditModal(false)}
        onSave={handleEditSubmit}
        title="Edit Client"
        loading={editLoading}
        fields={selectedClient ? [
          { name: 'company_name', label: 'Company Name', type: 'text', value: editFormData.company_name || '', onChange: (v) => setEditFormData({ ...editFormData, company_name: v }) },
          { name: 'website_url', label: 'Website', type: 'text', value: editFormData.website_url || '', onChange: (v) => setEditFormData({ ...editFormData, website_url: v }) },
          { name: 'primaryColor', label: 'Primary Color', type: 'color', value: editFormData.primaryColor || selectedClient.widget_config?.primaryColor || '#635BFF', onChange: (v) => setEditFormData({ ...editFormData, primaryColor: v }) },
          { name: 'secondaryColor', label: 'Secondary Color', type: 'color', value: editFormData.secondaryColor || selectedClient.widget_config?.secondaryColor || '#0A2540', onChange: (v) => setEditFormData({ ...editFormData, secondaryColor: v }) },
          { name: 'position', label: 'Widget Position', type: 'select', value: editFormData.position || selectedClient.widget_config?.position || 'bottom-right', onChange: (v) => setEditFormData({ ...editFormData, position: v }), options: ['bottom-right', 'bottom-left'] },
          { name: 'welcomeMessage', label: 'Welcome Message', type: 'text', value: editFormData.welcomeMessage ?? selectedClient.widget_config?.welcomeMessage ?? '', onChange: (v) => setEditFormData({ ...editFormData, welcomeMessage: v }) },
          { name: 'starter_suggestions', label: 'Starter Suggestions', type: 'custom' as const, value: '', onChange: () => {}, renderCustom: () => (
            <StarterSuggestions
              value={editStarterSuggestions}
              onChange={setEditStarterSuggestions}
            />
          )},
          { name: 'status', label: 'Status', type: 'select', value: editFormData.status || '', onChange: (v) => setEditFormData({ ...editFormData, status: v }), options: ['active', 'inactive', 'trial'] },
        ] : []}
      />

      {/* DELETE MODAL */}
      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Deactivate Client"
        itemName={selectedClient?.company_name || ''}
        loading={deleteLoading}
      />
      {NotificationComponent}
    </div>
  );
};

export default Clients;