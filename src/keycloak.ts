/* semTUI/I2T-frontend/src/keycloak.ts
 *
 * Simplified Keycloak helper.
 *
 * - Removes any WebCrypto polyfills.
 * - Keeps the original keycloak-js behaviour when the browser environment supports it.
 * - Supports a server-backed login flow endpoint at `/api/auth/keycloak/login`
 *   which performs PKCE + token exchange server-side and sets HTTP-only cookies.
 *
 * Exports:
 * - initKeycloak(options?)
 * - login(opts?)
 * - loginServer()
 * - logout()
 * - getToken()
 * - getTokenParsed()
 * - getUserInfo()
 * - isAuthenticated()
 * - default export: keycloak instance
 *
 * Notes:
 * - The server-backed endpoints implemented in the backend must exist:
 *   - GET /api/auth/keycloak/login   -> redirects to Keycloak (server starts PKCE)
 *   - GET /api/auth/keycloak/callback -> callback that exchanges code and sets cookies
 *   - GET /api/auth/keycloak/me      -> returns { loggedIn: boolean, tokenPayload?: {...} }
 *
 * - The helper prefers keycloak-js when available and falls back to the server flow when the
 *   browser doesn't provide native Web Crypto (so PKCE client-side wouldn't work).
 */

import Keycloak, { KeycloakInstance, KeycloakInitOptions } from "keycloak-js";

type InitOptions = {
  onAuthenticated?: () => void;
  onLogout?: () => void;
};

/* Read Vite env */
const realmUrlRaw = (import.meta.env.VITE_KEYCLOAK_REALM as string) || "";
const clientId =
  (import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string) || "semtui_frontend";

/* Parse full realm URL into base URL and realm name */
let kcBaseUrl: string | undefined;
let kcRealmName: string | undefined;

if (realmUrlRaw) {
  try {
    const parsed = new URL(realmUrlRaw);
    const pathname = parsed.pathname || "";

    // match /realms/<realmName>
    const m = pathname.match(/\/realms\/([^\/\s]+)/);
    if (m && m[1]) {
      kcRealmName = m[1];
      // base is everything before /realms (could be root)
      const basePath =
        pathname.substring(0, pathname.indexOf("/realms/")) || "";
      kcBaseUrl = `${parsed.origin}${basePath}`.replace(/\/+$/, "");
    } else {
      // fallback: last pathname segment is realm
      const segs = pathname.split("/").filter(Boolean);
      if (segs.length > 0) {
        kcRealmName = segs[segs.length - 1];
      }
      kcBaseUrl = parsed.origin;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("VITE_KEYCLOAK_REALM is not a valid URL:", realmUrlRaw, err);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_KEYCLOAK_REALM is not set. Keycloak will not be initialized.",
  );
}

/* Build Keycloak config object and instance */
const kcConfig = {
  url: kcBaseUrl,
  realm: kcRealmName,
  clientId,
};
const keycloak: KeycloakInstance = new Keycloak(kcConfig as any);

/* API base for server endpoints (use Vite env if provided) */
const RAW_API_BASE =
  (import.meta.env.VITE_BACKEND_API_URL as string | undefined) ||
  (import.meta.env.VITE_BASE_URI as string | undefined) ||
  "";

/* Normalize API base:
   - trim trailing slashes
   - remove a trailing '/api' segment if present
   This prevents double '/api/api/...' when the env already contains '/api'. */
const API_BASE = ((): string => {
  if (!RAW_API_BASE) return "";
  let v = RAW_API_BASE.replace(/\/+$/, "");
  v = v.replace(/\/api$/, "");
  return v;
})();

/* Internal state: server-side token payload (populated by /api/auth/keycloak/me) */
let serverTokenPayload: Record<string, any> | undefined;

/* Helper: check server-side session (backend must expose /api/auth/keycloak/me) */
async function checkServerSession(): Promise<boolean> {
  try {
    // If Keycloak redirected back with the access token in the URL fragment (#access_token=...),
    // capture it into localStorage so client-side code can use it (simple fallback).
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.hash
    ) {
      const m = window.location.hash.match(/[#&]access_token=([^&]+)/);
      if (m && m[1]) {
        try {
          const tokenFromFragment = decodeURIComponent(m[1]);
          try {
            localStorage.setItem("kc_token", tokenFromFragment);
          } catch (e) {
            // ignore storage errors
          }
          // remove fragment from URL to avoid leaking token on reload
          try {
            const cleanUrl = window.location.pathname + window.location.search;
            history.replaceState(null, "", cleanUrl);
          } catch (e) {
            // ignore history errors
          }
        } catch (e) {
          // ignore decoding errors
        }
      }
    }

    const base = API_BASE ? API_BASE : "";
    const url = base ? `${base}/api/auth/keycloak/me` : "/api/auth/keycloak/me";
    // Use credentials: 'include' so cookies are sent on cross-origin requests when configured.
    const resp = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    if (data && data.loggedIn) {
      serverTokenPayload = data.tokenPayload;
      return true;
    }
    return false;
  } catch (e) {
    // network error or endpoint missing
    return false;
  }
}

/* idempotent init promise */
let _initPromise: Promise<boolean> | null = null;

/**
 * Initialize Keycloak.
 * - Tries keycloak-js initialization (client-side PKCE) first.
 * - If the browser lacks Web Crypto or keycloak init fails, falls back to checking server session.
 */
export function initKeycloak(options?: InitOptions): Promise<boolean> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const nativeSubtle = !!(
      typeof window !== "undefined" &&
      window.crypto &&
      ((window.crypto as any).subtle || (window.crypto as any).webkitSubtle)
    );

    // If native subtle is missing, do not attempt a client PKCE init that will throw;
    // instead check server session immediately.
    if (!nativeSubtle) {
      const serverLogged = await checkServerSession();
      if (serverLogged) {
        options?.onAuthenticated?.();
        return true;
      }
      options?.onAuthenticated?.();
      return false;
    }

    // Client-side initialization using keycloak-js (preserve original behavior)
    const initOptions: KeycloakInitOptions = {
      onLoad: "check-sso",
      pkceMethod: "S256",
      promiseType: "native",
    } as KeycloakInitOptions;

    try {
      const authenticated = await keycloak.init(initOptions);
      if (authenticated && keycloak.token) {
        try {
          localStorage.setItem("kc_token", keycloak.token);
        } catch {
          // ignore storage errors
        }

        // token refresh handler
        keycloak.onTokenExpired = () => {
          keycloak
            .updateToken(30)
            .then((refreshed: boolean) => {
              if (refreshed && keycloak.token) {
                try {
                  localStorage.setItem("kc_token", keycloak.token);
                } catch {
                  // ignore
                }
              }
            })
            .catch(() => {
              // ignore refresh failure
            });
        };

        keycloak.onAuthLogout = options?.onLogout;
      } else {
        try {
          localStorage.removeItem("kc_token");
        } catch {
          // ignore
        }
      }

      options?.onAuthenticated?.();
      return authenticated;
    } catch (err) {
      // if client init fails, fallback to server session check
      // eslint-disable-next-line no-console
      console.error(
        "Keycloak init failed, falling back to server session check:",
        err,
      );
      const serverLogged = await checkServerSession();
      if (serverLogged) {
        options?.onAuthenticated?.();
        return true;
      }
      _initPromise = null;
      options?.onAuthenticated?.();
      return false;
    }
  })();

  return _initPromise;
}

/**
 * Login
 *
 * - If opts?.serverOnly is true, always redirect to server login endpoint.
 * - If the browser lacks Web Crypto, redirect to server login endpoint.
 * - Otherwise use keycloak-js login() (existing behavior).
 */
export async function login(opts?: { serverOnly?: boolean }): Promise<void> {
  const nativeSubtle = !!(
    typeof window !== "undefined" &&
    window.crypto &&
    ((window.crypto as any).subtle || (window.crypto as any).webkitSubtle)
  );

  if (opts?.serverOnly || !nativeSubtle) {
    const base = API_BASE ? API_BASE : "";
    const loginUrl = base
      ? `${base}/api/auth/keycloak/login`
      : "/api/auth/keycloak/login";
    window.location.assign(loginUrl);
    return Promise.resolve();
  }

  try {
    // Use keycloak-js (preserves previous client-side flow)
    return await keycloak.login();
  } catch (err) {
    // fallback: server-side login
    try {
      const base = API_BASE ? API_BASE : "";
      const loginUrl = base
        ? `${base}/api/auth/keycloak/login`
        : "/api/auth/keycloak/login";
      window.location.assign(loginUrl);
    } catch {
      // nothing else to do
    }
    return Promise.resolve();
  }
}

/* Explicit server-side login helper */
export function loginServer(): void {
  const base = API_BASE ? API_BASE : "";
  const loginUrl = base
    ? `${base}/api/auth/keycloak/login`
    : "/api/auth/keycloak/login";
  window.location.assign(loginUrl);
}

/* Logout: attempt client logout; note server-side logout endpoint not implemented here */
export function logout(params?: { redirectUri?: string }): Promise<void> {
  try {
    localStorage.removeItem("kc_token");
  } catch {
    /* ignore */
  }
  try {
    return keycloak.logout(params);
  } catch {
    return Promise.resolve();
  }
}

/* Get token (client-side only). Server-side tokens are stored in httpOnly cookies and not accessible. */
export async function getToken(): Promise<string | null> {
  try {
    await keycloak.updateToken(30).catch(() => false);
  } catch {
    /* ignore */
  }

  // Prefer client-side Keycloak token when available
  if (keycloak.token) return keycloak.token;

  // Fallback: try the value we may have stored from the fragment or prior flows
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("kc_token");
      if (stored) return stored;
    }
  } catch (e) {
    // ignore storage errors
  }

  return null;
}

/* Token parsing / user info helpers: prefer client-side parsed token, otherwise use server payload */
export function getTokenParsed(): Record<string, any> | undefined {
  return (
    (keycloak.tokenParsed as Record<string, any> | undefined) ||
    serverTokenPayload
  );
}

export function getUserInfo(): { username?: string; email?: string } {
  const parsed = getTokenParsed();
  return {
    username: parsed?.preferred_username || parsed?.username,
    email: parsed?.email,
  };
}

/* Explicit server-side logout helper: redirect to backend logout which clears cookies and calls Keycloak end-session.
   Include frontend origin as post_logout_redirect_uri so Keycloak redirects back to the SPA after logout.
   Also include id_token_hint when available (take from client-side Keycloak token or localStorage). */
export function logoutServer(): void {
  try {
    localStorage.removeItem("kc_token");
  } catch {
    // ignore
  }
  const base = API_BASE ? API_BASE : "";
  const redirect = `${window.location.origin}/`;

  // Prefer client-side Keycloak token if available, fall back to localStorage entry.
  const tokenHint =
    (typeof keycloak !== "undefined" && (keycloak.token ?? null)) ||
    (typeof window !== "undefined" ? localStorage.getItem("kc_token") : null);

  const idHintParam = tokenHint
    ? `&id_token_hint=${encodeURIComponent(tokenHint)}`
    : "";

  const logoutUrl = base
    ? `${base}/api/auth/keycloak/logout?post_logout_redirect_uri=${encodeURIComponent(redirect)}${idHintParam}`
    : `/api/auth/keycloak/logout?post_logout_redirect_uri=${encodeURIComponent(redirect)}${idHintParam}`;
  window.location.assign(logoutUrl);
}

export function isAuthenticated(): boolean {
  return !!(keycloak.authenticated || serverTokenPayload);
}

/* Default export */
export default keycloak;
