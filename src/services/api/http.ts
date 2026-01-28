/**
 * Minimal axios wrapper for the I2T-frontend application.
 *
 * - Attaches Authorization: Bearer <token> header to requests
 * - Priority: Keycloak token (localStorage.kc_token) > legacy app token (localStorage.app_token)
 * - Exposes helper functions to set/clear the legacy app token (used by username/password flows)
 *
 * Usage:
 * import api from "@services/api/http";
 * api.get("/datasets");
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Read token from storage. Priority:
 * 1) kc_token (Keycloak)
 * 2) app_token (legacy JWT issued by backend)
 */
export function readAuthToken(): string | null {
  try {
    const kc = localStorage.getItem("kc_token");
    if (kc && kc !== "undefined" && kc !== "null") return kc;
    const app = localStorage.getItem("app_token");
    if (app && app !== "undefined" && app !== "null") return app;
    return null;
  } catch (err) {
    // If access to localStorage fails (e.g., SSR), return null
    return null;
  }
}

/**
 * Set legacy app token (keep compatibility with existing signin flow).
 * Keycloak token is managed by keycloak helper.
 */
export function setAppToken(token: string | null) {
  if (token) {
    localStorage.setItem("app_token", token);
  } else {
    localStorage.removeItem("app_token");
  }
}

/**
 * Clear both tokens from storage (use on logout).
 */
export function clearAuthTokens() {
  try {
    localStorage.removeItem("kc_token");
    localStorage.removeItem("app_token");
  } catch (err) {
    // noop
  }
}

/**
 * Create axios instance with baseURL from Vite env.
 */
const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || (import.meta.env.VITE_BASE_URL as string | undefined) || "";

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  // Optionally set a timeout
  timeout: 30_000,
});

/**
 * Request interceptor: attach Authorization header when a token exists.
 */
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = readAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor: handle common scenarios (401).
 * Minimal behavior: propagate the error; caller can react (e.g., redirect to login).
 * You may expand this to auto-refresh token or call logout flow if desired.
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    // You can customize handling here. Minimal: forward the error.
    // Example of a small convenience: clear legacy token on 401 if present (optional)
    if (error?.response?.status === 401) {
      // Optionally clear only legacy token, keep Keycloak handling to frontend logic
      // clearAuthTokens();
    }
    return Promise.reject(error);
  },
);

export default api;
