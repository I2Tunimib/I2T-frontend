import { RouteContainer } from "@components/layout";
import useInit from "@hooks/init/useInit";
import React, { Component, Suspense, useEffect } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import Route from "@components/core/Route";
import { Loader, useSocketIo } from "@components/core";
import { useSnackbar } from "notistack";
import { useAppDispatch } from "@hooks/store";
import {
  updateTableSocket,
  updateSchemaSocket,
} from "@store/slices/table/table.thunk";
import { updateCurrentTable } from "@store/slices/table/table.slice";
import { GetTableResponse, GetSchemaResponse } from "@services/api/table";
import { Button } from "@mui/material";
import { getRedirects, getRoutes } from "./routes";
import { initKeycloak, getUserInfo, API_BASE } from "./keycloak";
import { authMe, authLogout } from "./store/slices/auth/auth.thunk";
import { setKeycloakAuth } from "./store/slices/auth/auth.slice";

// Make enqueueSnackbar globally available for API interceptors
declare global {
  interface Window {
    enqueueSnackbar: (message: string, options?: any) => void;
  }
}

/**
 * Catches dynamic-import / chunk-loading failures (e.g. stale Vite ?v=HASH
 * after a dev-server restart) and responds with a hard page reload so the
 * browser fetches fresh chunks instead of crashing into the catch-all redirect.
 */
const CHUNK_RELOAD_KEY = "chunkErrorReloaded";

class ChunkErrorBoundary extends Component<
  { children: React.ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };

  // Clear the reload flag once we mount successfully so future dev-server
  // restarts still get one retry.
  componentDidMount() {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error) {
    const msg = error?.message ?? "";
    const isChunkError =
      msg.includes("dynamically imported module") ||
      msg.includes("Failed to fetch") ||
      msg.includes("error loading");
    if (isChunkError && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      // First failure — reload once hoping Vite serves fresh chunks.
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
    }
    // Otherwise (already reloaded, or non-chunk error): leave crashed=true
    // so we render nothing instead of re-mounting the broken subtree.
  }

  render() {
    if (this.state.crashed) return null;
    return this.props.children;
  }
}

const App = () => {
  // initialize app
  const loading = useInit();
  const socket = useSocketIo();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Initialize Keycloak on app startup (minimal) and check standard auth concurrently.
  // We run both checks (standard auth via authMe and Keycloak init) and only log the user out
  // if BOTH checks report unauthenticated.
  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      try {
        // Start standard auth check (authMe) and Keycloak init concurrently.
        const authMePromise = dispatch(authMe())
          .then((res: any) => {
            // createAsyncThunk resolves to an action with payload under .payload in RTK
            const payload = res && (res.payload ?? res);
            return payload && payload.loggedIn ? true : false;
          })
          .catch(() => false);

        // Do NOT use onAuthenticated to dispatch state updates: keycloak.ts fires that
        // callback in ALL code paths (including auth failures), which would overwrite
        // the user restored by authMe with empty Keycloak data on every reload.
        // Instead we handle state updates after both promises resolve.
        const kcPromise = initKeycloak({
          onLogout: () => {
            dispatch(setKeycloakAuth({ loggedIn: false }));
          },
        })
          .then((authenticated) => !!authenticated)
          .catch(() => false);

        const [meLoggedIn, kcLoggedIn] = await Promise.all([
          authMePromise,
          kcPromise,
        ]);

        if (cancelled) return;

        if (!meLoggedIn && !kcLoggedIn) {
          // Neither method authenticated — clear both auth states.
          dispatch(authLogout());
          dispatch(setKeycloakAuth({ loggedIn: false }));
        } else if (!meLoggedIn && kcLoggedIn) {
          // Standard auth failed but Keycloak succeeded — set Keycloak user info.
          // Only do this when standard auth failed to avoid overwriting the real
          // database user (with its correct id) with the id:0 Keycloak placeholder.
          const userInfo = getUserInfo();
          if (userInfo.username) {
            dispatch(
              setKeycloakAuth({
                loggedIn: true,
                user: {
                  id: 0,
                  username: userInfo.username,
                  email: userInfo.email,
                },
              }),
            );
          }
        }
        // If meLoggedIn is true (regardless of Keycloak), authMe already set the
        // correct user in the store — do not overwrite it.
      } catch (err) {
        console.error("Initialization authentication error:", err);
        // Be conservative: if error occurs, do not automatically log the user out here;
        // let individual auth flows determine their own state or rely on authMe/authed reducers.
      }
    }

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  // Set global enqueueSnackbar for API interceptors
  useEffect(() => {
    window.enqueueSnackbar = enqueueSnackbar;
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (socket) {
      socket.on("done", (data: GetTableResponse) => {
        const { table } = data;
        const tablePath = `/datasets/${table.idDataset}/tables/${table.id}`;
        dispatch(updateTableSocket(data));
        enqueueSnackbar(`Annotation for table ${table.name} completed`, {
          variant: "success",
          action:
            location.pathname === tablePath
              ? (key) => (
                <Button
                  sx={{ color: "#ffffff" }}
                  component={Link}
                  to={tablePath}
                  onClick={() => closeSnackbar(key)}
                >
                  view
                </Button>
              )
              : undefined,
        });
      });
      socket.on("schema-done", (data: GetSchemaResponse) => {
        const { table } = data;
        const tablePath = `/datasets/${table.idDataset}/tables/${table.id}`;
        console.log("data", data);
        dispatch(updateSchemaSocket(data));
        enqueueSnackbar(`Annotation schema for table ${table.name} completed`, {
          variant: "success",
          action:
            location.pathname === tablePath
              ? (key) => (
                  <Button
                    sx={{ color: "#ffffff" }}
                    component={Link}
                    to={tablePath}
                    onClick={() => closeSnackbar(key)}
                  >
                    view
                  </Button>
                )
              : undefined,
        });
      });
      socket.on("compliance-done", (data: any) => {
        if (data.status === "DONE") {
          dispatch(
            updateCurrentTable({
              complianceStatus: "DONE",
              complianceReports: data.complianceReports,
            }),
          );
        } else if (data.status === "ERROR") {
          dispatch(updateCurrentTable({ complianceStatus: "ERROR" }));
        }
      });
    }
  }, [socket]);

  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<Loader />}>
        <RouteContainer loadChildren={loading === false}>
          {getRoutes().map((routeProps, index) => (
            <Route key={index} {...routeProps} />
          ))}
          {getRedirects().map((redirectProps, index) => (
            <Redirect key={index} {...redirectProps} />
          ))}
        </RouteContainer>
      </Suspense>
    </ChunkErrorBoundary>
  );
};

export default App;
