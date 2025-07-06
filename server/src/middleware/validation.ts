import { Request, Response, NextFunction } from 'express';
import { ValidationResult, ValidationError } from '@/types';
import { isValidEmail, isValidUrl, isValidPassword, sanitizeString } from '@/utils/helpers';
import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants';

// Validation schemas
const validationSchemas = {
  login: {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'string', minLength: 1 }
  },
  register: {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'password', minLength: 6 },
    role: { required: false, type: 'enum', values: ['admin', 'user'] }
  },
  createUser: {
    email: { required: true, type: 'email' },
    password: { required: true, type: 'password', minLength: 6 },
    role: { required: true, type: 'enum', values: ['admin', 'user'] }
  },
  updateUser: {
    email: { required: false, type: 'email' },
    password: { required: false, type: 'password', minLength: 6 },
    role: { required: false, type: 'enum', values: ['admin', 'user'] },
    isActive: { required: false, type: 'boolean' }
  },
  createProxyRule: {
    name: { required: true, type: 'string', minLength: 1, maxLength: 100 },
    pattern: { required: true, type: 'string', minLength: 1 },
    forwardTarget: { required: false, type: 'url' },
    isBlocking: { required: true, type: 'boolean' },
    priority: { required: false, type: 'number', min: 1, max: 1000 }
  },
  updateProxyRule: {
    name: { required: false, type: 'string', minLength: 1, maxLength: 100 },
    pattern: { required: false, type: 'string', minLength: 1 },
    forwardTarget: { required: false, type: 'url' },
    isBlocking: { required: false, type: 'boolean' },
    isEnabled: { required: false, type: 'boolean' },
    priority: { required: false, type: 'number', min: 1, max: 1000 }
  },
  pagination: {
    page: { required: false, type: 'number', min: 1 },
    limit: { required: false, type: 'number', min: 1, max: 100 },
    sortBy: { required: false, type: 'string' },
    sortOrder: { required: false, type: 'enum', values: ['asc', 'desc'] }
  }
};

// Validation functions
const validators = {
  email: (value: any): boolean => {
    return typeof value === 'string' && isValidEmail(value);
  },
  password: (value: any, minLength: number = 6): boolean => {
    return typeof value === 'string' && isValidPassword(value);
  },
  url: (value: any): boolean => {
    return !value || (typeof value === 'string' && isValidUrl(value));
  },
  string: (value: any, minLength: number = 1, maxLength?: number): boolean => {
    if (typeof value !== 'string') return false;
    if (value.length < minLength) return false;
    if (maxLength && value.length > maxLength) return false;
    return true;
  },
  number: (value: any, min?: number, max?: number): boolean => {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  },
  boolean: (value: any): boolean => {
    return typeof value === 'boolean';
  },
  enum: (value: any, allowedValues: any[]): boolean => {
    return allowedValues.includes(value);
  }
};

// Main validation function
const validateData = (data: any, schema: any): ValidationResult => {
  const errors: ValidationError[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldRules = rules as any;

    // Check if required
    if (fieldRules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        value
      });
      continue;
    }

    // Skip validation if field is not required and not provided
    if (!fieldRules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    let isValid = false;
    switch (fieldRules.type) {
      case 'email':
        isValid = validators.email(value);
        break;
      case 'password':
        isValid = validators.password(value, fieldRules.minLength);
        break;
      case 'url':
        isValid = validators.url(value);
        break;
      case 'string':
        isValid = validators.string(value, fieldRules.minLength, fieldRules.maxLength);
        break;
      case 'number':
        isValid = validators.number(value, fieldRules.min, fieldRules.max);
        break;
      case 'boolean':
        isValid = validators.boolean(value);
        break;
      case 'enum':
        isValid = validators.enum(value, fieldRules.values);
        break;
      default:
        isValid = true;
    }

    if (!isValid) {
      errors.push({
        field,
        message: `Invalid ${field}`,
        value
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Middleware factory
export const validate = (schemaName: keyof typeof validationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const schema = validationSchemas[schemaName];
    const data = { ...req.body, ...req.query, ...req.params };

    // Sanitize string inputs
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        data[key] = sanitizeString(data[key]);
      }
    });

    const validation = validateData(data, schema);

    if (!validation.isValid) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION.INVALID_INPUT,
        errors: validation.errors
      });
      return;
    }

    // Update request with sanitized data
    req.body = { ...req.body, ...data };
    next();
  };
};

// Specific validation middlewares
export const validateLogin = validate('login');
export const validateRegister = validate('register');
export const validateCreateUser = validate('createUser');
export const validateUpdateUser = validate('updateUser');
export const validateCreateProxyRule = validate('createProxyRule');
export const validateUpdateProxyRule = validate('updateProxyRule');
export const validatePagination = validate('pagination');

// Custom validation for specific cases
export const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid ID format'
    });
    return;
  }
  
  next();
};

export const validateSearchQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { search } = req.query;
  
  if (search && typeof search === 'string' && search.length > 100) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Search query too long'
    });
    return;
  }
  
  next();
}; 