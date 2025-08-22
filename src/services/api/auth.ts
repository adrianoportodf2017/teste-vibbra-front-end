import api from '../http';
import type { LoginCredentials, SSOCredentials, AuthResponse } from '../../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const r = await api.post<AuthResponse>('/authenticate', credentials);
    return r.data;
  },
  async ssoLogin(credentials: SSOCredentials): Promise<AuthResponse> {
    const r = await api.post<AuthResponse>('/authenticate/sso', credentials);
    return r.data;
  },
  async logout(): Promise<void> {
    localStorage.removeItem('token');
  },
};
