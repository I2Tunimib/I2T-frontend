import { useCallback, useEffect, useRef, useState } from "react";
import usersAPI from "@services/api/users";

export type AclRole = "viewer" | "editor";

export type AclUser = {
  id: string | number;
  username: string;
  email?: string;
  roles?: string[];
};

type Acl = { viewers?: (string | number)[]; editors?: (string | number)[] };

type Options<T extends Acl> = {
  /** Load nothing while closed. */
  open: boolean;
  /** Reload when the resource being managed changes (e.g. `${datasetId}/${tableId}`). */
  resourceKey: string;
  load: () => Promise<T>;
  addUser: (userId: string, role: AclRole) => Promise<unknown>;
  removeUser: (userId: string, role: AclRole) => Promise<unknown>;
  /** Called after the first load on open (not after refreshes). */
  onLoaded?: (acl: T) => void;
  /** Called after every successful add/remove. */
  onMutated?: () => void;
};

const SEARCH_DEBOUNCE_MS = 300;

const errorMessage = (e: any): string =>
  e?.response?.data?.error || e?.message;

/**
 * Everything the dataset and table access-control dialogs share: loading the
 * ACL, resolving member ids to users, debounced user search, add and remove.
 */
export const useAclManager = <T extends Acl>({
  open,
  resourceKey,
  load,
  addUser,
  removeUser,
  onLoaded,
  onMutated,
}: Options<T>) => {
  const [acl, setAcl] = useState<T | null>(null);
  const [viewersInfo, setViewersInfo] = useState<AclUser[]>([]);
  const [editorsInfo, setEditorsInfo] = useState<AclUser[]>([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AclUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<AclUser[]>([]);
  const [section, setSection] = useState<AclRole>("viewer");

  // the callbacks change every render; the effects must not restart for that
  const latest = useRef({ load, onLoaded });
  latest.current = { load, onLoaded };

  const reload = useCallback(async () => {
    const next = await latest.current.load();
    setAcl(next);
    return next;
  }, []);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const next = await reload();
        latest.current.onLoaded?.(next);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [open, resourceKey, reload]);

  // resolve member ids to display info
  useEffect(() => {
    if (!acl) return;
    const fetchUser = async (id: string | number): Promise<AclUser> => {
      try {
        const r = await usersAPI.search(String(id));
        return (r.data && r.data[0]) || { id, username: String(id) };
      } catch {
        return { id, username: String(id) };
      }
    };
    (async () => {
      try {
        setViewersInfo(await Promise.all((acl.viewers || []).map(fetchUser)));
        setEditorsInfo(await Promise.all((acl.editors || []).map(fetchUser)));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [acl]);

  // debounced user search
  useEffect(() => {
    const t = setTimeout(() => {
      if (!query) return setSearchResults([]);
      usersAPI
        .search(query)
        .then((r) => setSearchResults(r.data))
        .catch(() => setSearchResults([]));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  /** Run a mutation; report failures to the user and swallow them. */
  const run = useCallback(async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (e) {
      console.error(e);
      alert(errorMessage(e));
    }
  }, []);

  /** Switching role starts a fresh search. */
  const changeSection = (next: AclRole) => {
    setSection(next);
    setQuery("");
    setSearchResults([]);
  };

  const add = () => {
    if (selectedUsers.length === 0) return;
    return run(async () => {
      await Promise.all(selectedUsers.map((u) => addUser(String(u.id), section)));
      await reload();
      onMutated?.();
      setQuery("");
      setSearchResults([]);
      setSelectedUsers([]);
    });
  };

  const remove = (userId: string | number, role: AclRole) =>
    run(async () => {
      await removeUser(String(userId), role);
      await reload();
      onMutated?.();
    });

  return {
    acl,
    reload,
    run,
    viewersInfo,
    editorsInfo,
    query,
    setQuery,
    searchResults,
    selectedUsers,
    setSelectedUsers,
    section,
    setSection: changeSection,
    add,
    remove,
  };
};

export type AclManager = ReturnType<typeof useAclManager>;
