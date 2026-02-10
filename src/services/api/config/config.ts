import { setup } from "axios-cache-adapter";

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

// Add request interceptor to attach Authorization header and log outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    try {
      // Prefer Keycloak token (kc_token) and fall back to legacy app token (app_token)
      const kcToken = localStorage.getItem("kc_token");
      const appToken = localStorage.getItem("app_token");
      const token = kcToken || appToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // accessing localStorage may fail in some environments; ignore silently
    }

    console.log("Outgoing request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor to log responses
apiClient.interceptors.response.use(
  (response) => {
    console.log("Response received:", {
      status: response.status,
      url: response.config.url,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error(
      "❌ Response error:",
      error.response?.status,
      error.response?.data,
    );
    // Show snackbar for API errors with error message
    if (error.response?.data?.error) {
      window.enqueueSnackbar?.(error.response.data.error, { variant: "error" });
    }
    return Promise.reject(error);
  },
);

export default apiClient;
