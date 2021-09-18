import { AxiosRequestConfig } from 'axios';
import { setup } from 'axios-cache-adapter';

/**
 * Setup axios client with base URL and cache adapter
 */

const apiClient = setup({
  baseURL: process.env.REACT_APP_BACKEND_API_URL,
  cache: {
    maxAge: 15 * 60 * 1000,
    exclude: {
      paths: [/^\/tables\/.*$/]
    },
    invalidate: async (config, request) => {
      if (config.store && request.clearCacheEntry) {
        await (config.store as any).removeItem((config as any).uuid);
      }
    }
  }
});

/**
 * Setup additional interceptors if needed...
 */

// apiClient.interceptors.request.use((config) => {
//   return ({
//     ...config,
//     headers: {
//       ...
//     },
//   })
// },
//   error => Promise.reject(error),
// );

// apiClient.interceptors.response.use((response) =>
//   response,
//   async (error) => {
//     ...
//     return Promise.reject(error.response.data);
//   },
// );

export default apiClient;
