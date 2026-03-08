import axios from "axios";
import { supabase } from "./supabase";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL environment variable');
}

/**
 * Dashboard API instance - AUTHENTICATED
 * 
 * USE FOR:
 * - /api/me (user role fetching)
 * - /api/dashboard/* (all dashboard endpoints)
 * - Any endpoint requiring Supabase auth token
 * 
 * BEHAVIOR:
 * - Automatically attaches Authorization: Bearer <supabase_access_token> header
 * - Redirects to /login on 401 (EXCEPT for /me endpoint to prevent auth loops)
 * - Set timeout: 10s
 */
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRedirecting = false;

/* Request interceptor - attach Supabase token for authenticated endpoints */
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get the cached session (Supabase.getSession() is synchronous internally)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error("Error getting Supabase session:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Response interceptor - handle 401 gracefully */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Prevent redirect loops during initial auth setup
    // If /me endpoint returns 401, user is legitimately unauthenticated
    // AuthContext.fetchUserRole() will handle this gracefully by setting userRole=null
    if (status === 401 && url !== '/me' && !isRedirecting) {
      isRedirecting = true;
      console.warn("Unauthorized (401) - redirecting to login");
      window.location.href = "/login";
      
      // Reset flag after 1 second (prevents rapid redirect attempts)
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
