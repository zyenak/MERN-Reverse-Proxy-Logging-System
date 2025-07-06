// Environment variables
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/reverse-proxy-logger',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  ALGORITHM: 'HS256' as const,
  ISSUER: 'mern-reverse-proxy',
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d'
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  PROXY: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000
  }
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
} as const;

// Request Limits
export const REQUEST_LIMITS = {
  MAX_BODY_SIZE: '10mb',
  MAX_URL_LENGTH: 2048,
  MAX_HEADERS_COUNT: 50
} as const;

// Logging
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Proxy Rule Types
export const PROXY_RULE_TYPES = {
  FORWARD: 'forward',
  BLOCK: 'block'
} as const;

// Database Collections
export const COLLECTIONS = {
  USERS: 'users',
  LOGS: 'logs',
  PROXY_RULES: 'proxyRules'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTHENTICATION: {
    NO_TOKEN: 'No token provided.',
    INVALID_TOKEN: 'Invalid token.',
    TOKEN_EXPIRED: 'Token expired.',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions.',
    AUTHENTICATION_REQUIRED: 'Authentication required.'
  },
  VALIDATION: {
    INVALID_INPUT: 'Invalid input data.',
    MISSING_REQUIRED_FIELD: 'Missing required field.',
    INVALID_EMAIL: 'Invalid email format.',
    INVALID_PASSWORD: 'Password must be at least 6 characters long.',
    INVALID_URL: 'Invalid URL format.'
  },
  NOT_FOUND: {
    USER: 'User not found.',
    LOG: 'Log not found.',
    PROXY_RULE: 'Proxy rule not found.',
    RESOURCE: 'Resource not found.'
  },
  CONFLICT: {
    USER_EXISTS: 'User already exists.',
    PROXY_RULE_EXISTS: 'Proxy rule already exists.'
  },
  SERVER: {
    CONFIGURATION_ERROR: 'Server configuration error.',
    DATABASE_ERROR: 'Database connection error.',
    INTERNAL_ERROR: 'Internal server error.'
  }
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTHENTICATION: {
    LOGIN_SUCCESS: 'Login successful.',
    LOGOUT_SUCCESS: 'Logout successful.',
    REGISTER_SUCCESS: 'Registration successful.'
  },
  CRUD: {
    CREATED: 'Resource created successfully.',
    UPDATED: 'Resource updated successfully.',
    DELETED: 'Resource deleted successfully.',
    FETCHED: 'Resource fetched successfully.'
  }
} as const; 