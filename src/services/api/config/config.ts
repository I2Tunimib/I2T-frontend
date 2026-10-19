import { setup } from "axios-cache-adapter";
import { getAuthToken } from "../auth-token";

/**
 * Setup axios client with base URL and cache adapter
 */

const apiClient = setup({
  baseURL: import.meta.env.VITE_BACKEND_API_URL,
  cache: {
    maxAge: 15 * 60 * 1000,
    invalidate: async (config, request) => {
      if (config.store && request.clearCacheEntry) {
        await (config.store as any).removeItem((config as any).uuid);
      }
    },
  },
});

// The only place the Authorization header is set (see ../auth-token.ts).
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface API error messages to the user.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      window.enqueueSnackbar?.(error.response.data.error, { variant: "error" });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
