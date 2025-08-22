import api from '../http';
import type { User, UserResponse, UpdateUserData } from '../../types';

export const usersService = {
  async getUserById(id: number): Promise<UserResponse> {
    const r = await api.get<UserResponse>(`/user/${id}`);
    return r.data;
  },
  async createUser(userData: User): Promise<UserResponse> {
    const r = await api.post<UserResponse>('/user', userData);
    return r.data;
  },
  async updateUser(id: number, userData: UpdateUserData): Promise<UserResponse> {
    const r = await api.put<UserResponse>(`/user/${id}`, userData);
    return r.data;
  },
};
