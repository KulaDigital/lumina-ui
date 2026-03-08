/**
 * Centralized API layer for all application endpoints
 */

import axiosInstance from '../utils/instance';
import publicAxios from '../utils/publicInstance';

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const authApi = {
  getMe: async (skipRedirect?: boolean) => {
    const response = await axiosInstance.get('/me', {
      params: skipRedirect ? { skipRedirect: true } : {},
    });
    return response.data;
  },

  getAdminMe: async () => {
    const response = await axiosInstance.get('/admin/me');
    return response.data;
  },
};

// ============================================================================
// CLIENT ENDPOINTS
// ============================================================================

export const clientApi = {
  getClientProfile: async () => {
    const response = await axiosInstance.get('/client/me');
    return response.data;
  },

  getConversations: async (params?: { limit?: number; sort?: string; status?: string }) => {
    const response = await axiosInstance.get('/client/conversations', { params });
    return response.data;
  },

  getConversationHistory: async (conversationId: string | number) => {
    const response = await axiosInstance.get(`/chat/history/${conversationId}`);
    return response.data;
  },

  getScraperContent: async () => {
    const response = await axiosInstance.get('/scraper/content');
    return response.data;
  },

  getScraperStats: async () => {
    const response = await axiosInstance.get('/scraper/chunk-stats');
    return response.data;
  },

  getLeads: async (query: string) => {
    const response = await axiosInstance.get(query);
    return response.data;
  },

  testQuery: async (query: string, apiKey: string) => {
    const response = await axiosInstance.post('/api/search/test', { query }, {
      headers: { 'X-API-Key': apiKey },
    });
    return response.data;
  },
};

// ============================================================================
// ADMIN - CLIENT MANAGEMENT ENDPOINTS
// ============================================================================

export const adminClientsApi = {
  getClientsByStatus: async (status: 'active' | 'inactive') => {
    const response = await axiosInstance.get(`/admin/clients/status/${status}`);
    return response.data;
  },

  getAllClients: async () => {
    const response = await axiosInstance.get('/admin/clients');
    return response.data;
  },

  getClient: async (clientId: number | string) => {
    const response = await axiosInstance.get(`/admin/clients/${clientId}`);
    return response.data;
  },

  getClientsWithSubscriptions: async (status: 'active' | 'inactive' = 'active') => {
    const response = await axiosInstance.get(`/admin/clients/with-subscriptions/${status}`);
    return response.data;
  },

  getClientConversations: async (clientId: number | string, params?: { page?: number; limit?: number; status?: string; sort?: string }) => {
    const response = await axiosInstance.get(`/admin/clients/${clientId}/conversations`, { params });
    return response.data;
  },

  updateClient: async (clientId: number | string, data: Record<string, any>) => {
    const response = await axiosInstance.put(`/admin/clients/${clientId}`, data);
    return response.data;
  },

  updateClientStatus: async (clientId: number | string, status: 'active' | 'inactive') => {
    const response = await axiosInstance.patch(`/admin/clients/${clientId}/status`, { status });
    return response.data;
  },

  deleteClient: async (clientId: number | string) => {
    const response = await axiosInstance.delete(`/admin/clients/${clientId}`);
    return response.data;
  },
};

// ============================================================================
// ADMIN - USER MANAGEMENT ENDPOINTS
// ============================================================================

export const adminUsersApi = {
  getUsersByStatus: async (status: 'active' | 'inactive') => {
    const response = await axiosInstance.get(`/admin/users/status/${status}`);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  createUser: async (data: Record<string, any>) => {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (userId: number | string, data: Record<string, any>) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: number | string) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

// ============================================================================
// ADMIN - LEADS ENDPOINTS
// ============================================================================

export const adminLeadsApi = {
  getLeads: async (params?: { clientId?: number; q?: string; from?: string; to?: string; limit?: number; offset?: number }) => {
    const response = await axiosInstance.get('/admin/leads', { params });
    return response.data;
  },
};

// ============================================================================
// ADMIN - SUPPORT & TICKETS ENDPOINTS
// ============================================================================

export const adminSupportApi = {
  getTickets: async () => {
    const response = await axiosInstance.get('/api/admin/support-tickets');
    return response.data;
  },
};

// ============================================================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================================================

export const publicApi = {
  createClient: async (data: Record<string, any>) => {
    const response = await publicAxios.post('/clients', data);
    return response.data;
  },
};

// ============================================================================
// Batch/Utility endpoints
// ============================================================================

export const fetchScraperData = async () => {
  const [contentData, statsData] = await Promise.all([
    clientApi.getScraperContent(),
    clientApi.getScraperStats(),
  ]);
  return { content: contentData, stats: statsData };
};
