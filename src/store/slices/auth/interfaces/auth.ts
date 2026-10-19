export type User = {
  id: number;
  username: string;
  email?: string;
};

export type AuthContextState = {
  authenticated: boolean;
  user?: User;
};

// Define a type for the slice state
export interface IAuthState {
  loggedIn: boolean;
  user?: User;
}
