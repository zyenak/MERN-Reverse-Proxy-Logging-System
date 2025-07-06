import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/constants';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 handler
export const notFound = (req: Request, res: Response) => {
  const error = new AppError(
    `${ERROR_MESSAGES.NOT_FOUND.RESOURCE}: ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND
  );
  
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: error.message,
    error: 'Not Found'
  });
};

// Global error handler
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.SERVER.INTERNAL_ERROR;

  // Handle AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.VALIDATION.INVALID_INPUT;
  }
  // Handle MongoDB duplicate key errors
  else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = ERROR_MESSAGES.CONFLICT.USER_EXISTS;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.AUTHENTICATION.INVALID_TOKEN;
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.AUTHENTICATION.TOKEN_EXPIRED;
  }
  // Handle cast errors (invalid ObjectId)
  else if (error.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = ERROR_MESSAGES.VALIDATION.INVALID_INPUT;
  }

  // Log error details
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id
    },
    statusCode
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error handler
export const handleValidationError = (errors: any[]) => {
  const errorMessages = errors.map(error => ({
    field: error.path,
    message: error.message,
    value: error.value
  }));

  return new AppError(
    ERROR_MESSAGES.VALIDATION.INVALID_INPUT,
    HTTP_STATUS.BAD_REQUEST
  );
}; 