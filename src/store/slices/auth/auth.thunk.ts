import { createAsyncThunk } from '@reduxjs/toolkit';
import authAPI, { MeParams, SignInParams } from '@services/api/auth';

const ACTION_PREFIX = 'config';

export enum AuthThunkActions {
  AUTH_SIGNIN = 'signIn',
  AUTH_ME = 'me',
  AUTH_LOGOUT = 'logout'
}

export const authSignIn = createAsyncThunk(
  `${ACTION_PREFIX}/signIn`,
  async (params: SignInParams, { rejectWithValue }) => {
    try {
      const responseSignIn = await authAPI.signIn(params);
      const responseMe = await authAPI.me({ token: responseSignIn.data.token });

      if (responseMe.data.loggedIn) {
        localStorage.setItem('token', responseSignIn.data.token);
      }

      return responseMe.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const authMe = createAsyncThunk(
  `${ACTION_PREFIX}/me`,
  async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return {
        loggedIn: false
      };
    }

    const responseMe = await authAPI.me({ token });

    return responseMe.data;
  }
);

export const authLogout = createAsyncThunk(
  `${ACTION_PREFIX}/logout`,
  async () => {
    localStorage.removeItem('token');
    return null;
  }
);
