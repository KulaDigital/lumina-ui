import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL environment variable');
}

/**
 * Public API instance for non-authenticated calls (widgets, public data, etc.)
 * Does NOT attach Bearer tokens or handle 401 redirects
 */
const publicAxios = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicAxios;
