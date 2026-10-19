import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authLogout, authMe, authSignIn } from "./auth.thunk";
import { IAuthState, User } from "./interfaces/auth";

const initialState: IAuthState = {
  loggedIn: false,
};

// signIn and me both answer with { loggedIn, user? }; fields they omit are kept
const mergeAuth = (state: IAuthState, action: PayloadAction<Partial<IAuthState>>) => {
  Object.assign(state, action.payload);
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setKeycloakAuth: (
      state,
      action: { payload: { loggedIn: boolean; user?: User } },
    ) => {
      state.loggedIn = action.payload.loggedIn;
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(authSignIn.fulfilled, mergeAuth)
      .addCase(authMe.fulfilled, mergeAuth)
      .addCase(authLogout.fulfilled, (state) => {
        state.loggedIn = false;
        state.user = undefined;
      }),
});

export const { setKeycloakAuth } = authSlice.actions;

export default authSlice.reducer;
