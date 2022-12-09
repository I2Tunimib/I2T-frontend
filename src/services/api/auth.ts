import { User } from '@store/slices/auth/interfaces/auth';
import { apiEndpoint } from '../../configHelpers';
import apiClient from './config/config';

export type SignInParams = {
  username: string;
  password: string;
}
type SignInResponse = {
  token: string;
}

export type MeParams = {
  token: string;
}
type MeResponse = {
  loggedIn: boolean;
  user?: User;
}

const authAPI = {
  signIn: (params: SignInParams) => apiClient.post<SignInResponse>(
    apiEndpoint({
      endpoint: 'AUTH_SIGNIN'
    }),
    params,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  ),
  me: (params: MeParams) => apiClient.post<MeResponse>(
    apiEndpoint({
      endpoint: 'AUTH_ME'
    }),
    params,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  )
};

export default authAPI;
