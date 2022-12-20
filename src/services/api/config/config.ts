import { setup } from 'axios-cache-adapter';

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
    }
  }
});

export default apiClient;
