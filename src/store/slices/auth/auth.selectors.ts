import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store';
import { getRequestStatus } from '@store/enhancers/requests';
import { AuthThunkActions } from './auth.thunk';

const selectRequests = (state: RootState) => state.table._requests;
const selectAuthState = (state: RootState) => state.auth;

export const selectSignInStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, AuthThunkActions.AUTH_SIGNIN)
);

export const selectMeStatus = createSelector(
  selectRequests,
  (requests) => getRequestStatus(requests, AuthThunkActions.AUTH_ME)
);

export const selectIsLoggedIn = createSelector(
  selectAuthState,
  (state) => ({
    loggedIn: state.loggedIn,
    user: state.user
  })
);
