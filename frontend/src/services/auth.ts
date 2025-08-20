import { api } from './api';
import type { 
  AuthResponse, 
  LoginForm, 
  RegisterForm, 
  User 
} from '../types';

export const authService = {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  async register(userData: RegisterForm): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', userData);
  },

  async logout(): Promise<void> {
    return api.post<void>('/auth/logout');
  },

  async getProfile(): Promise<User> {
    return api.get<User>('/auth/profile');
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    return api.put<User>('/auth/profile', userData);
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/refresh', { refreshToken });
  },
};