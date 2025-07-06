import { Request } from 'express';

// Extended Request interface with user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// JWT Payload interface
export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
  iss?: string;
}

// User interface
export interface User {
  _id?: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Log interface
export interface Log {
  _id?: string;
  timestamp: Date;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
  proxyRuleId?: string;
  requestBody?: any;
  responseBody?: any;
  metadata?: Record<string, any>;
}

// Proxy Rule interface
export interface ProxyRule {
  _id?: string;
  name: string;
  pattern: string;
  forwardTarget?: string;
  isBlocking: boolean;
  isEnabled: boolean;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

// Pagination interface
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

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
}

// Settings interface
export interface SystemSettings {
  maxLogRetentionDays: number;
  maxRequestSize: string;
  enableRateLimiting: boolean;
  enableRequestLogging: boolean;
  enableProxyLogging: boolean;
  corsOrigins: string[];
  jwtExpirationHours: number;
  maxProxyRules: number;
  maxUsers: number;
}

// Filter interfaces
export interface LogFilters {
  method?: string;
  statusCode?: number;
  userId?: string;
  proxyRuleId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface UserFilters {
  role?: 'admin' | 'user';
  isActive?: boolean;
  search?: string;
}

export interface ProxyRuleFilters {
  isEnabled?: boolean;
  isBlocking?: boolean;
  search?: string;
}

// Request/Response interfaces for API endpoints
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface CreateProxyRuleRequest {
  name: string;
  pattern: string;
  forwardTarget?: string;
  isBlocking: boolean;
  priority?: number;
}

export interface UpdateProxyRuleRequest {
  name?: string;
  pattern?: string;
  forwardTarget?: string;
  isBlocking?: boolean;
  isEnabled?: boolean;
  loggingEnabled?: boolean;
  priority?: number;
}

// Database interfaces
export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
}

// Middleware interfaces
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// Validation interfaces
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
} 