import apiService from './api';
import type { User } from '@/types';

export class UserService {
  async getUsers(): Promise<User[]> {
    return apiService.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  async createUser(userData: { username: string; password: string; role?: 'admin' | 'user' }): Promise<User> {
    return apiService.post<User>('/users', userData);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return apiService.put<User>(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<void> {
    return apiService.delete<void>(`/users/${id}`);
  }
}

export const userService = new UserService();
export default userService; 