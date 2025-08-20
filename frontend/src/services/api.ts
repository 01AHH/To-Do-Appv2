import { useAuthStore } from '../stores/auth';
import type { ApiResponse, ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token
    const { tokens } = useAuthStore.getState();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(tokens?.accessToken && {
          Authorization: `Bearer ${tokens.accessToken}`,
        }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiResponse = await response.json().catch(() => ({
          success: false,
          message: 'Network error occurred',
          timestamp: new Date().toISOString(),
        }));
        
        // Handle 401 unauthorized - token expired
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry original request with new token
            return this.request<T>(endpoint, options);
          } else {
            // Refresh failed, logout user
            useAuthStore.getState().logout();
            window.location.href = '/login';
            throw new Error('Session expired');
          }
        }
        
        const error: ApiError = {
          message: errorData.message || 'An error occurred',
          code: errorData.code,
          errors: errorData.errors,
        };
        
        throw error;
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        const error: ApiError = {
          message: data.message || 'An error occurred',
          code: data.code,
          errors: data.errors,
        };
        throw error;
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      const apiError: ApiError = {
        message: 'Network error occurred',
      };
      throw apiError;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const { tokens } = useAuthStore.getState();
      
      if (!tokens?.refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data: ApiResponse = await response.json();
      
      if (data.success && data.data?.tokens) {
        useAuthStore.getState().updateTokens(data.data.tokens);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService(API_URL);