import { api } from './api';
import type { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters,
  PaginatedResponse,
  TaskStats
} from '../types';

export const tasksService = {
  async getTasks(params?: TaskFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Task>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return api.get<PaginatedResponse<Task>>(`/tasks${query}`);
  },

  async getTask(id: string): Promise<Task> {
    return api.get<Task>(`/tasks/${id}`);
  },

  async createTask(task: CreateTaskRequest): Promise<Task> {
    return api.post<Task>('/tasks', task);
  },

  async updateTask(id: string, task: UpdateTaskRequest): Promise<Task> {
    return api.put<Task>(`/tasks/${id}`, task);
  },

  async deleteTask(id: string): Promise<void> {
    return api.delete<void>(`/tasks/${id}`);
  },

  async getTaskStats(): Promise<TaskStats> {
    return api.get<TaskStats>('/tasks/stats');
  },

  async bulkDeleteCompleted(): Promise<void> {
    return api.delete<void>('/tasks/completed/bulk');
  },
};