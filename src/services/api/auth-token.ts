/**
 * The only place that knows where auth tokens are stored.
 *
 * - Keycloak writes `kc_token` (see keycloak.ts).
 * - The legacy username/password login writes `token` (see auth.thunk.ts).
 * The HTTP client's request interceptor attaches whichever exists, Keycloak
 * first, so API modules must not set Authorization headers themselves.
 */
export const KEYCLOAK_TOKEN_KEY = "kc_token";
export const LEGACY_TOKEN_KEY = "token";

const read = (key: string): string | null => {
  try {
    const value = localStorage.getItem(key);
    // a literal "undefined"/"null" gets stored when a missing value is written
    return value && value !== "undefined" && value !== "null" ? value : null;
  } catch {
    // localStorage can be unavailable (SSR, privacy modes)
    return null;
  }
};

export const getLegacyToken = (): string | null => read(LEGACY_TOKEN_KEY);

export const getAuthToken = (): string | null =>
  read(KEYCLOAK_TOKEN_KEY) ?? getLegacyToken();

export const setLegacyToken = (token: string) =>
  localStorage.setItem(LEGACY_TOKEN_KEY, token);

export const clearLegacyToken = () => localStorage.removeItem(LEGACY_TOKEN_KEY);
