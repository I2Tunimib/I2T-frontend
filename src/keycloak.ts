import Keycloak, { KeycloakInstance, KeycloakInitOptions } from "keycloak-js";

/**
 * Keycloak helper (simplified)
 *
 * - Uses a single Vite env var: VITE_KEYCLOAK_REALM
 *   This must be the full realm URL, e.g.:
 *     VITE_KEYCLOAK_REALM=http://vm.chronos.disco.unimib.it:8007/realms/DAVE
 *
 * - Optional Vite var: VITE_KEYCLOAK_CLIENT_ID (if omitted a sensible default is used)
 *
 * Behavior:
 * - Extracts base URL + realm name from VITE_KEYCLOAK_REALM
 * - Provides idempotent `initKeycloak()` to initialize the client once
 * - Exposes `login()`, `logout()`, `getToken()`, `getUserInfo()` and default export `keycloak`
 *
 * Note: This file intentionally avoids requiring additional env variables.
 */

/* Read env */
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
    // invalid URL
    // eslint-disable-next-line no-console
    console.error("VITE_KEYCLOAK_REALM is not a valid URL:", realmUrlRaw, err);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_KEYCLOAK_REALM is not set. Keycloak will not be initialized.",
  );
}

/* Build Keycloak config object */
const kcConfig = {
  url: kcBaseUrl,
  realm: kcRealmName,
  clientId,
};

/* Create instance */
const keycloak: KeycloakInstance = new Keycloak(kcConfig as any);

/* idempotent init promise */
let _initPromise: Promise<boolean> | null = null;

/**
 * Initialize Keycloak once. Returns a promise that resolves to whether the user is authenticated.
 * Keep init options minimal — no extra envs required.
 */
export function initKeycloak(options?: {
  onAuthenticated?: () => void;
  onLogout?: () => void;
}): Promise<boolean> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    const initOptions: KeycloakInitOptions = {
      onLoad: "check-sso", // do not force login; prefer existing session if present
      pkceMethod: "S256",
      promiseType: "native",
      // Note: we avoid requiring an extra static file. If you add silent-check-sso.html
      // at the app root you can enable silentCheckSsoRedirectUri here.
    };

    try {
      const authenticated = await keycloak.init(initOptions);

      if (authenticated && keycloak.token) {
        try {
          localStorage.setItem("kc_token", keycloak.token);
        } catch (e) {
          // ignore storage errors
        }

        keycloak.onTokenExpired = () => {
          keycloak
            .updateToken(30)
            .then((refreshed) => {
              if (refreshed && keycloak.token) {
                try {
                  localStorage.setItem("kc_token", keycloak.token);
                } catch (e) {
                  // ignore
                }
              }
            })
            .catch(() => {
              // token refresh failed - let app handle re-login if needed
            });
        };

        keycloak.onAuthLogout = options?.onLogout;
      } else {
        try {
          localStorage.removeItem("kc_token");
        } catch (e) {
          // ignore
        }
      }

      options?.onAuthenticated?.();
      return authenticated;
    } catch (err) {
      // initialization failed; clear token and allow retry next call
      try {
        localStorage.removeItem("kc_token");
      } catch (e) {
        // ignore
      }
      _initPromise = null;
      // eslint-disable-next-line no-console
      console.error("Keycloak init error:", err);
      return false;
    }
  })();

  return _initPromise;
}

/* Trigger redirect to Keycloak login */
export function login(): Promise<void> {
  return keycloak.login();
}

/* Logout and clear token from storage */
export function logout(params?: { redirectUri?: string }): Promise<void> {
  try {
    localStorage.removeItem("kc_token");
  } catch (e) {
    // ignore
  }
  return keycloak.logout(params);
}

/* Get token (attempt refresh if needed) */
export async function getToken(): Promise<string | null> {
  try {
    // try refresh if token expires in < 30s
    await keycloak.updateToken(30).catch(() => false);
  } catch {
    // ignore
  }
  return keycloak.token ?? null;
}

/* Helpers to read token payload / user info */
export function getTokenParsed(): Record<string, any> | undefined {
  return keycloak.tokenParsed as Record<string, any> | undefined;
}

export function getUserInfo(): { username?: string; email?: string } {
  const parsed = getTokenParsed();
  return {
    username: parsed?.preferred_username || parsed?.username,
    email: parsed?.email,
  };
}

export function isAuthenticated(): boolean {
  return !!keycloak.authenticated;
}

/* Default export Keycloak instance for advanced use */
export default keycloak;
