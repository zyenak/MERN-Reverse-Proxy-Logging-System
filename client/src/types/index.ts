export interface User {
  _id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;
}

export interface Log {
  _id: string;
  method: string;
  url: string;
  timestamp: string;
  status: number;
  user?: string;
  responseTime: number;
  proxyRuleId?: string;
  targetUrl?: string;
  isProxied: boolean;
  meta?: Record<string, any>;
}

export interface ProxyRule {
  _id: string;
  name: string;
  path: string;
  methods: string[];
  loggingEnabled: boolean;
  isBlocked: boolean;
  forwardTarget?: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LogStats {
  totalLogs: number;
  averageResponseTime: number;
  statusCodes: Record<string, number>;
  methods: Record<string, number>;
  recentActivity: {
    timestamp: string;
    count: number;
  }[];
}

export interface ProxyStatus {
  isActive: boolean;
  totalRequests: number;
  activeRules: number;
  lastRequest?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LogFilters {
  method?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateProxyRuleData {
  name: string;
  path: string;
  methods: string[];
  loggingEnabled: boolean;
  isBlocked: boolean;
  forwardTarget?: string;
  priority: number;
  enabled: boolean;
}

export interface UpdateProxyRuleData extends Partial<CreateProxyRuleData> {
  id: string;
} 