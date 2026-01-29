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
  Robust polyfill for Web Crypto `subtle.digest` (SHA-256):

  - Prefer native `window.crypto.subtle` if present (including webkitSubtle).
  - If missing, try to attach a `subtle.digest` implementation using `js-sha256`.
  - Do NOT assign `window.crypto = ...` because `crypto` can be a read-only / getter-only property in some environments.
  - Instead:
    1) If `window.crypto` exists and is an object, try to define `window.crypto.subtle` using Object.defineProperty.
    2) If `window.crypto` does NOT exist, try to define `window.crypto` on window using Object.defineProperty (may fail if the environment forbids it).
    3) If both approaches fail, fall back to not enabling PKCE S256 (safer than forcing an overwrite that throws).
  - We return whether the polyfill was successfully installed so callers can decide whether S256 can be used.
*/

function createFallbackSubtle() {
  return {
    digest: async (algorithm: string, data: ArrayBuffer | ArrayBufferView) => {
      const alg = (algorithm || "").toUpperCase();
      if (alg !== "SHA-256" && alg !== "SHA256") {
        throw new Error("Fallback subtle.digest only supports SHA-256");
      }

      // coerce to ArrayBuffer
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

      // js-sha256 offers arrayBuffer output
      // @ts-ignore
      const ab = (sha256 as any).arrayBuffer(new Uint8Array(inputBuf));
      if (ab instanceof ArrayBuffer) return ab;
      if (ab instanceof Uint8Array) return ab.buffer.slice(0);
      return new Uint8Array(ab).buffer;
    },
  };
}

function tryInstallSubtleFallback(): boolean {
  if (typeof window === "undefined") return false;

  const nativeSubtle = !!(
    window.crypto &&
    ((window.crypto as any).subtle || (window.crypto as any).webkitSubtle)
  );
  if (nativeSubtle) return true;

  const fallback = createFallbackSubtle();

  // Case A: window.crypto exists and is an object -> attempt to define .subtle on it
  if ((window as any).crypto && typeof (window as any).crypto === "object") {
    try {
      // defineProperty avoids direct assignment which can throw in some browsers
      Object.defineProperty((window as any).crypto, "subtle", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: fallback,
      });
      // success
      // eslint-disable-next-line no-console
      console.warn(
        "Attached fallback crypto.subtle using js-sha256 on existing window.crypto",
      );
      return true;
    } catch (e) {
      // defining subtle failed (maybe crypto has a getter-only subtle or environment forbids)
      // fall through to try defining window.crypto itself
    }
  }

  // Case B: window.crypto does not exist or defineProperty on crypto failed -> try to define window.crypto
  try {
    // NOTE: defining global properties may also fail in some hosts (non-configurable)
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: false,
      writable: false,
      value: { subtle: fallback },
    });
    // eslint-disable-next-line no-console
    console.warn("Defined window.crypto with fallback subtle using js-sha256");
    return true;
  } catch (e) {
    // Could not define window.crypto either. This environment is restrictive.
  }

  // Case C: try to define a non-enumerable fallback property name to be used by our code only.
  // We can't guarantee Keycloak or other libs will look there, but we can indicate failure so callers can avoid using S256.
  // eslint-disable-next-line no-console
  console.warn(
    "Unable to attach crypto.subtle fallback (read-only environment). PKCE S256 will be disabled.",
  );
  return false;
}

/* Attempt to install polyfill and record whether it's present for our use */
const polyfillInstalled = tryInstallSubtleFallback();

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
    // Decide whether to enable PKCE S256:
    // - Use S256 if native subtle exists OR our polyfill was successfully installed.
    const subtleAvailable =
      !!(
        window.crypto &&
        ((window.crypto as any).subtle || (window.crypto as any).webkitSubtle)
      ) || polyfillInstalled;

    const initOptions: KeycloakInitOptions = {
      onLoad: "check-sso", // do not force login; prefer existing session if present
      // enable S256 only if subtle is available (native or our installed polyfill)
      pkceMethod: subtleAvailable ? "S256" : undefined,
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
