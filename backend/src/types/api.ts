import { TaskStatus, Priority, GoalCategory } from '@prisma/client';

// Common API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: string[];
  timestamp: string;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth types
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Task types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  backburnerDate?: string;
  categoryId?: string;
  tags?: string[];
  parentTaskId?: string;
  estimatedHours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  backburnerDate?: string;
  categoryId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  position?: number;
}

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: Priority | Priority[];
  categoryId?: string;
  search?: string;
  dueDate?: string;
  tags?: string[];
  parentTaskId?: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  backburnerDate: string | null;
  completedAt: string | null;
  position: number;
  estimatedHours: number | null;
  actualHours: number | null;
  tags: string[];
  userId: string;
  categoryId: string | null;
  parentTaskId: string | null;
  createdAt: string;
  updatedAt: string;
  category?: CategoryResponse;
  subtasks?: TaskResponse[];
}

// Goal types
export interface CreateGoalRequest {
  title: string;
  description?: string;
  category?: GoalCategory;
  targetDate?: string;
  parentGoalId?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  category?: GoalCategory;
  targetDate?: string;
  progressPercentage?: number;
  isCompleted?: boolean;
}

export interface GoalResponse {
  id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  targetDate: string | null;
  progressPercentage: number;
  isCompleted: boolean;
  userId: string;
  parentGoalId: string | null;
  createdAt: string;
  updatedAt: string;
  subgoals?: GoalResponse[];
}

// Category types
export interface CreateCategoryRequest {
  name: string;
  color?: string;
  description?: string;
  isFavorite?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  description?: string;
  isFavorite?: boolean;
}

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  description: string | null;
  isFavorite: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}

// Stats and analytics types
export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  backburner: number;
  overdue: number;
  completionRate: number;
}

export interface GoalStats {
  total: number;
  completed: number;
  inProgress: number;
  averageProgress: number;
  completionRate: number;
}