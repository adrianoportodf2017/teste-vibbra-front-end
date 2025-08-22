import type { Location } from './deals';

export interface User {
  id?: number;               
  name: string;
  email: string;
  login: string;
  password?: string;         
  location: Location;
  avatar_url?: string;
}

export interface LoginCredentials { login: string; password: string; }
export interface SSOCredentials { login: string; app_token: string; }
export interface AuthResponse { token: string; user: User; }
export interface UserResponse { user: User; }
