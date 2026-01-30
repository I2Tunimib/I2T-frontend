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

  // Initialize Keycloak on app startup (minimal)
  useEffect(() => {
    initKeycloak({
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
    }).then(async (authenticated) => {
      console.log("Keycloak initialized, authenticated:", authenticated);
      if (!authenticated) {
        // Fallback: check server-side session endpoint to see if backend completed PKCE login
        try {
          const url = API_BASE
            ? `${API_BASE}/api/auth/keycloak/me`
            : "/api/auth/keycloak/me";
          const resp = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.loggedIn && data.tokenPayload) {
              dispatch(
                setKeycloakAuth({
                  loggedIn: true,
                  user: {
                    id: 0,
                    username:
                      data.tokenPayload.preferred_username ||
                      data.tokenPayload.username ||
                      "",
                    email: data.tokenPayload.email,
                  },
                }),
              );
              return;
            }
          }
        } catch (e) {
          // network or parsing error - fall through to unauthenticated state
        }
        dispatch(setKeycloakAuth({ loggedIn: false }));
      }
    });
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
