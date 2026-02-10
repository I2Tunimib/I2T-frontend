import { createSliceWithRequests } from "@store/enhancers/requests";
import { authLogout, authMe, authSignIn } from "./auth.thunk";
import { IAuthState, User } from "./interfaces/auth";

// Define the initial state using that type
const initialState: IAuthState = {
  loggedIn: false,
  _requests: { byId: {}, allIds: [] },
};

export const authSlice = createSliceWithRequests({
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
  extraRules: (builder) =>
    builder
      .addCase(authSignIn.fulfilled, (state, action) => {
        state = {
          ...state,
          ...action.payload,
        };
        return state;
      })
      .addCase(authMe.fulfilled, (state, action) => {
        state = {
          ...state,
          ...action.payload,
        };
        return state;
      })
      .addCase(authLogout.fulfilled, (state, action) => {
        state = {
          ...state,
          loggedIn: false,
          user: undefined,
        };
        return state;
      }),
});

export const { setKeycloakAuth } = authSlice.actions;

export default authSlice.reducer;
