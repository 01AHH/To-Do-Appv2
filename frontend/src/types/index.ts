// API Types matching backend
export const TaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BACKBURNER: 'BACKBURNER'
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

export const GoalCategory = {
  PERSONAL_GROWTH: 'PERSONAL_GROWTH',
  PROFESSIONAL: 'PROFESSIONAL',
  HEALTH: 'HEALTH',
  FINANCIAL: 'FINANCIAL',
  LEARNING: 'LEARNING',
  OTHER: 'OTHER'
} as const;

export type GoalCategory = typeof GoalCategory[keyof typeof GoalCategory];

// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  preferences?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Task Types
export interface Task {
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
  category?: Category;
  subtasks?: Task[];
}

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
  dueDate?: string | null;
  backburnerDate?: string | null;
  categoryId?: string | null;
  tags?: string[];
  estimatedHours?: number | null;
  actualHours?: number | null;
  position?: number;
}

// Goal Types
export interface Goal {
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
  subgoals?: Goal[];
}

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
  targetDate?: string | null;
  progressPercentage?: number;
  isCompleted?: boolean;
}

// Category Types
export interface Category {
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

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  errors?: string[];
  timestamp: string;
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

// Statistics Types
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

// UI Types
export interface Theme {
  mode: 'light' | 'dark' | 'system';
}

export interface UserPreferences {
  theme: Theme['mode'];
  sidebarCollapsed: boolean;
  defaultTaskView: 'list' | 'kanban' | 'calendar';
  notifications: {
    email: boolean;
    push: boolean;
    deadlineReminders: boolean;
    goalMilestones: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name?: string;
}

// Filter Types
export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: Priority | Priority[];
  categoryId?: string;
  search?: string;
  dueDate?: string;
  tags?: string[];
  parentTaskId?: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  errors?: string[];
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local';
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}