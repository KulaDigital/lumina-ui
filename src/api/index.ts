/**
 * Centralized API layer for all application endpoints
 * Ensures single source of truth for API calls and consistent error handling
 */

import axiosInstance from '../utils/instance';
import publicAxios from '../utils/publicInstance';

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

export const authApi = {
  /**
   * Fetch current user role and info
   * Used by: AuthContext, multiple pages
   */
  getMe: async (skipRedirect?: boolean) => {
    const response = await axiosInstance.get('/me', {
      params: skipRedirect ? { skipRedirect: true } : {},
    });
    return response.data;
  },
};

// ============================================================================
// CLIENT ENDPOINTS
// ============================================================================

export const clientApi = {
  /**
   * Fetch current client's profile and subscription data
   * Used by: ClientDashboard, ChatbotConfiguration, ClientSidebar
   */
  getClientProfile: async () => {
    const response = await axiosInstance.get('/client/me');
    return response.data;
  },

  /**
   * Fetch all conversations for current client
   * Used by: Conversations page
   */
  getConversations: async () => {
    const response = await axiosInstance.get('/client/conversations');
    return response.data;
  },

  /**
   * Fetch conversation history by ID
   * Used by: Conversations page
   */
  getConversationHistory: async (conversationId: string | number) => {
    const response = await axiosInstance.get(`/chat/history/${conversationId}`);
    return response.data;
  },

  /**
   * Fetch scraper content for client
   * Used by: ClientDashboard, WebScraper
   */
  getScraperContent: async () => {
    const response = await axiosInstance.get('/scraper/content');
    return response.data;
  },

  /**
   * Fetch scraper statistics
   * Used by: ClientDashboard, WebScraper
   */
  getScraperStats: async () => {
    const response = await axiosInstance.get('/scraper/chunk-stats');
    return response.data;
  },

  /**
   * Fetch leads/queries for client
   * Used by: Leads page
   */
  getLeads: async (query: string) => {
    const response = await axiosInstance.get(query);
    return response.data;
  },

  /**
   * Test ad-hoc query against knowledge base
   * Used by: ChatbotConfiguration (Test Chatbot feature)
   * Bypasses chat endpoints, nothing is stored
   */
  testQuery: async (query: string, apiKey: string) => {
    const response = await axiosInstance.post('/api/search/test', {
      query,
    }, {
      headers: {
        'X-API-Key': apiKey,
      },
    });
    return response.data;
  },
};

// ============================================================================
// ADMIN - CLIENT MANAGEMENT ENDPOINTS
// ============================================================================

export const adminClientsApi = {
  /**
   * Fetch clients by status
   * Used by: Clients page, AddUser (for dropdown)
   */
  getClientsByStatus: async (status: 'active' | 'inactive') => {
    const response = await axiosInstance.get(`/admin/clients/status/${status}`);
    return response.data;
  },

  /**
   * Fetch single client details
   * Used by: Clients page (view/edit modals)
   */
  getClient: async (clientId: number | string) => {
    const response = await axiosInstance.get(`/admin/clients/${clientId}`);
    return response.data;
  },

  /**
   * Update client information and configuration
   * Used by: Clients page (edit modal)
   */
  updateClient: async (
    clientId: number | string,
    data: Record<string, any>
  ) => {
    const response = await axiosInstance.put(
      `/admin/clients/${clientId}`,
      data
    );
    return response.data;
  },

  /**
   * Activate or deactivate client
   * Used by: Clients page
   */
  updateClientStatus: async (
    clientId: number | string,
    status: 'active' | 'inactive'
  ) => {
    const response = await axiosInstance.patch(
      `/admin/clients/${clientId}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Delete client
   * Used by: Clients page (delete modal)
   */
  deleteClient: async (clientId: number | string) => {
    const response = await axiosInstance.delete(`/admin/clients/${clientId}`);
    return response.data;
  },
};

// ============================================================================
// ADMIN - USER MANAGEMENT ENDPOINTS
// ============================================================================

export const adminUsersApi = {
  /**
   * Fetch users by status
   * Used by: Users page
   */
  getUsersByStatus: async (status: 'active' | 'inactive') => {
    const response = await axiosInstance.get(`/admin/users/status/${status}`);
    return response.data;
  },

  /**
   * Create new user
   * Used by: AddUser page
   */
  createUser: async (data: Record<string, any>) => {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  },

  /**
   * Update user information
   * Used by: Users page
   */
  updateUser: async (userId: number | string, data: Record<string, any>) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user
   * Used by: Users page
   */
  deleteUser: async (userId: number | string) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

// ============================================================================
// ADMIN - SUPPORT & TICKETS ENDPOINTS
// ============================================================================

export const adminSupportApi = {
  /**
   * Fetch support tickets
   * Used by: Tickets page
   */
  getTickets: async () => {
    const response = await axiosInstance.get('/api/admin/support-tickets');
    return response.data;
  },
};

// ============================================================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================================================

export const publicApi = {
  /**
   * Create new client via public registration
   * Used by: Public registration flow
   */
  createClient: async (data: Record<string, any>) => {
    const response = await publicAxios.post('/clients', data);
    return response.data;
  },
};

// ============================================================================
// Batch/Utility endpoints
// ============================================================================

/**
 * Fetch both scraper content and stats in parallel
 * Useful for: ClientDashboard optimization
 */
export const fetchScraperData = async () => {
  const [contentData, statsData] = await Promise.all([
    clientApi.getScraperContent(),
    clientApi.getScraperStats(),
  ]);
  return { content: contentData, stats: statsData };
};
