import { useSyncExternalStore } from "react";

export type DebugSettings = {
  disableWebsockets: boolean;
};

const STORAGE_KEY = "debugSettings";
const defaults: DebugSettings = { disableWebsockets: false };

const load = (): DebugSettings => {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"),
    };
  } catch {
    return defaults;
  }
};

let current: DebugSettings = load();
const listeners = new Set<() => void>();

export const isDebugMenuEnabled = () =>
  import.meta.env.VITE_DEBUG_MENU === "true";

// Settings only apply when the debug menu is enabled, so a stale localStorage value can't affect a normal build
export const getDebugSettings = (): DebugSettings =>
  isDebugMenuEnabled() ? current : defaults;

export const setDebugSetting = <K extends keyof DebugSettings>(
  key: K,
  value: DebugSettings[K],
) => {
  current = { ...current, [key]: value };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useDebugSettings = () =>
  useSyncExternalStore(subscribe, getDebugSettings);
