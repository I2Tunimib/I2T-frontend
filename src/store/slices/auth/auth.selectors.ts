import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@store";
import { createRequestStatusSelector } from "@store/slices/requests/requests.selectors";
import { authMe, authSignIn } from "./auth.thunk";

const selectAuthState = (state: RootState) => state.auth;

export const selectSignInStatus = createRequestStatusSelector(authSignIn);

export const selectMeStatus = createRequestStatusSelector(authMe);

export const selectIsLoggedIn = createSelector(selectAuthState, (state) => ({
  loggedIn: state.loggedIn,
  user: state.user,
}));
