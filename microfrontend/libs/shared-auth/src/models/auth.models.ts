export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'TELLER' | 'ADMIN' | 'CUSTOMER' | 'MANAGER';
  branchCode: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  user: User;
}

export interface AppEvent<T = unknown> {
  type: string;
  payload?: T;
}
