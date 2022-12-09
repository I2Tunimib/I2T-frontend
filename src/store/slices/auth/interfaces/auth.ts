import { RequestEnhancedState } from '@store/enhancers/requests';

export type User = {
  id: number;
  username: string;
}

export type AuthContextState = {
  authenticated: boolean;
  user?: User;
}

// Define a type for the slice state
export interface IAuthState extends RequestEnhancedState {
  loggedIn: boolean;
  user?: User;
}
