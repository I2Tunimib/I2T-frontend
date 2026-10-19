import { createAsyncThunk } from "@reduxjs/toolkit";
import authAPI, {
  MeParams,
  SignInParams,
  SignUpParams,
  VerifyParams,
} from "@services/api/auth";
import {
  clearLegacyToken,
  getLegacyToken,
  setLegacyToken,
} from "@services/api/auth-token";

const ACTION_PREFIX = "auth";

export const authSignIn = createAsyncThunk(
  `${ACTION_PREFIX}/signIn`,
  async (params: SignInParams, { rejectWithValue }) => {
    try {
      const responseSignIn = await authAPI.signIn(params);
      const responseMe = await authAPI.me({ token: responseSignIn.data.token });

      if (responseMe.data.loggedIn) {
        setLegacyToken(responseSignIn.data.token);
      }

      return responseMe.data;
    } catch (err) {
      return rejectWithValue((err as any).response.data);
    }
  }
);
export const authSignUp = createAsyncThunk(
  `${ACTION_PREFIX}/signUp`,
  async (params: SignUpParams) => {
    const response = await authAPI.signUp(params);
    return { status: response.status };
  }
);
export const authVerify = createAsyncThunk(
  `${ACTION_PREFIX}/verify`,
  async (params: VerifyParams, { rejectWithValue }) => {
    try {
      const response = await authAPI.verify(params);
      return response.data;
    } catch (err) {
      return rejectWithValue((err as any).response.data);
    }
  }
);
export const authMe = createAsyncThunk(`${ACTION_PREFIX}/me`, async () => {
  const token = getLegacyToken();

  if (!token) {
    return {
      loggedIn: false,
    };
  }

  const responseMe = await authAPI.me({ token });

  return responseMe.data;
});

export const authLogout = createAsyncThunk(
  `${ACTION_PREFIX}/logout`,
  async () => {
    clearLegacyToken();
    return null;
  }
);
