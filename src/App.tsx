import { RouteContainer } from "@components/layout";
import useInit from "@hooks/init/useInit";
import React, { Suspense, useEffect } from "react";
import { Link, Redirect, useLocation } from "react-router-dom";
import Route from "@components/core/Route";
import { Loader, useSocketIo } from "@components/core";
import { useSnackbar } from "notistack";
import { useAppDispatch } from "@hooks/store";
import {
  updateTableSocket,
  updateSchemaSocket,
} from "@store/slices/table/table.thunk";
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

        const kcPromise = initKeycloak({
          onAuthenticated: () => {
            const userInfo = getUserInfo();
            dispatch(
              setKeycloakAuth({
                loggedIn: true,
                user: {
                  id: 0,
                  username: userInfo.username || "",
                  email: userInfo.email,
                },
              }),
            );
          },
          onLogout: () => {
            dispatch(setKeycloakAuth({ loggedIn: false }));
          },
        })
          .then((authenticated) => {
            // initKeycloak returns true when Keycloak authenticated (client-side or server session)
            return !!authenticated;
          })
          .catch(() => {
            return false;
          });

        const [meLoggedIn, kcLoggedIn] = await Promise.all([
          authMePromise,
          kcPromise,
        ]);

        // If neither method authenticated the user, clear both auth states.
        if (!meLoggedIn && !kcLoggedIn) {
          // Clear local auth state (removes stored token) and ensure keycloak state is false.
          dispatch(authLogout());
          dispatch(setKeycloakAuth({ loggedIn: false }));
        } else {
          // At least one authentication method succeeded. If Keycloak succeeded, we already set Keycloak auth
          // in onAuthenticated above. If standard auth succeeded, authMe updated the store via its fulfilled reducer.
          // No further action needed here.
        }
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
    }
  }, [socket]);

  return (
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
  );
};

export default App;
