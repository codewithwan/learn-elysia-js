// User types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  avatar?: string;
}

// Task types
export const TaskStatus = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];
export type TaskPriorityType = (typeof TaskPriority)[keyof typeof TaskPriority];

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: TaskPriorityType;
  userId: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriorityType;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  dueDate?: string;
  tags?: string[];
}

// JWT payload type
export interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
}

// API Response types
export interface APIResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  status?: number;
}

export interface PaginatedResponse<T = any> {
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

// Query types
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
}

export interface TaskQuery extends SearchQuery {
  status?: string;
  priority?: string;
  tag?: string;
}

export interface UserQuery extends SearchQuery {
  // Additional user-specific filters can be added here
}

// Health check types
export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  version: string;
}

export interface ServiceStatus {
  status: string;
  services: {
    database: string;
    cache: string;
    external_api: string;
  };
  last_check: string;
}
