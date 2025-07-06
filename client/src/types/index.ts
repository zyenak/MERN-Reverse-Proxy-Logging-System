// Base Types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User extends BaseEntity {
  username: string;
  email: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'user';

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Log Types
export interface Log extends BaseEntity {
  method: string;
  url: string;
  timestamp: string;
  status: number;
  user?: string;
  requestedBy?: string;
  responseTime: number;
  proxyRuleId?: string;
  targetUrl?: string;
  isProxied: boolean;
  meta?: Record<string, any>;
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

export interface LogFilters {
  method?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Proxy Rule Types
export interface ProxyRule extends BaseEntity {
  name: string;
  path: string;
  methods: string[];
  loggingEnabled: boolean;
  isBlocked: boolean;
  forwardTarget?: string;
  priority: number;
  enabled: boolean;
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

// Proxy Status Types
export interface ProxyStatus {
  status: 'active' | 'inactive' | 'unknown';
  targetApi: string;
  activeRules: number;
  totalRules: number;
  totalRequests?: number;
  lastRequest?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeProxyRules: number;
  totalUsers: number;
  recentActivity: DashboardActivity[];
}

export interface DashboardActivity {
  id: string;
  method: string;
  url: string;
  status: number;
  timestamp: string;
  responseTime: number;
}

export interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
}

// API Response Types
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

export interface PaginatedData<T> {
  [key: string]: T[] | number;
  total: number;
}

// Component Props Types
export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
}

export interface PaginatedTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  totalCount?: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'switch';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

// Settings Types
export interface SystemSettings {
  proxy: {
    targetApi: string;
    timeout: number;
    maxRetries: number;
    enableCaching: boolean;
    cacheTimeout: number;
  };
  logging: {
    enabled: boolean;
    level: string;
    retentionDays: number;
    enableRequestLogging: boolean;
    enableResponseLogging: boolean;
  };
  security: {
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
    enableCORS: boolean;
    allowedOrigins: string[];
    enableJWTValidation: boolean;
    sessionTimeout: number;
  };
  performance: {
    enableCompression: boolean;
    enableGzip: boolean;
    maxPayloadSize: number;
    enableKeepAlive: boolean;
    keepAliveTimeout: number;
  };
} 