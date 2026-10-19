import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLegacyToken,
  getAuthToken,
  setLegacyToken,
} from "./auth-token";

const store = new Map<string, string>();

describe("auth token", () => {
  beforeEach(() => {
    store.clear();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    });
  });

  it("returns null when nothing is stored", () => {
    expect(getAuthToken()).toBeNull();
  });

  it("falls back to the legacy token", () => {
    setLegacyToken("legacy");
    expect(getAuthToken()).toBe("legacy");
  });

  it("prefers the Keycloak token over the legacy one", () => {
    setLegacyToken("legacy");
    store.set("kc_token", "kc");
    expect(getAuthToken()).toBe("kc");
  });

  it('ignores a stored "undefined" / "null" string', () => {
    store.set("kc_token", "undefined");
    store.set("token", "null");
    expect(getAuthToken()).toBeNull();
  });

  it("clearLegacyToken removes only the legacy token", () => {
    setLegacyToken("legacy");
    store.set("kc_token", "kc");
    clearLegacyToken();
    expect(getAuthToken()).toBe("kc");
    store.delete("kc_token");
    expect(getAuthToken()).toBeNull();
  });
});
