import Keycloak, { KeycloakInstance, KeycloakInitOptions } from "keycloak-js";
import sha256 from "js-sha256";

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

/*
  Library-backed polyfill for Web Crypto `subtle.digest` (SHA-256).

  - If native `window.crypto.subtle` exists, it is used (preferred).
  - If missing, this attaches a fallback implementation using `js-sha256`.
  - The fallback returns an ArrayBuffer to match the native subtle.digest signature.
  - The code below tries to avoid clobbering existing `crypto` fields.
*/
(function ensureWebCryptoSubtle() {
  if (typeof window === "undefined") return;

  const hasSubtle = !!(
    window.crypto &&
    (window.crypto.subtle || (window.crypto as any).webkitSubtle)
  );
  if (hasSubtle) return;

  // Ensure crypto object exists
  (window as any).crypto = (window as any).crypto || {};

  // Attach fallback subtle with sha256 from js-sha256 (arrayBuffer available)
  (window as any).crypto.subtle = {
    digest: async (algorithm: string, data: ArrayBuffer | ArrayBufferView) => {
      const alg = (algorithm || "").toUpperCase();
      if (alg !== "SHA-256" && alg !== "SHA256") {
        throw new Error("Fallback subtle.digest only supports SHA-256");
      }

      // coerce input to ArrayBuffer
      let inputBuf: ArrayBuffer;
      if (data instanceof ArrayBuffer) {
        inputBuf = data;
      } else if (ArrayBuffer.isView(data)) {
        inputBuf = data.buffer.slice(
          data.byteOffset,
          data.byteOffset + data.byteLength,
        );
      } else {
        inputBuf = new TextEncoder().encode(String(data)).buffer;
      }

      // Use js-sha256's arrayBuffer helper if available
      // @ts-ignore - `arrayBuffer` exists on js-sha256 in runtime
      const ab = (sha256 as any).arrayBuffer(new Uint8Array(inputBuf));
      if (ab instanceof ArrayBuffer) return ab;
      if (ab instanceof Uint8Array) return ab.buffer.slice(0);
      return new Uint8Array(ab).buffer;
    },
  };

  // eslint-disable-next-line no-console
  console.warn(
    "Web Crypto 'subtle' was missing. `js-sha256` is being used as a fallback. Serve over HTTPS to enable native Web Crypto.",
  );
})();

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
    // If crypto.subtle exists (native or fallback), keep pkceMethod S256.
    // Keycloak will use the digest implementation we provided above when native API is absent.
    const initOptions: KeycloakInitOptions = {
      onLoad: "check-sso",
      pkceMethod: "S256",
      promiseType: "native",
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
