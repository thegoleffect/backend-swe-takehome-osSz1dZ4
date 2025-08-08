import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error categories for better error handling
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL = 'internal'
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;
  let category = ErrorCategory.INTERNAL;

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
    
    // Categorize AppError based on status code
    if (statusCode >= 400 && statusCode < 500) {
      category = ErrorCategory.VALIDATION;
    }
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    isOperational = true;
    category = ErrorCategory.VALIDATION;
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    isOperational = true;
    category = ErrorCategory.VALIDATION;
  }

  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database error';
    isOperational = false;
    category = ErrorCategory.DATABASE;
  }

  // Handle authentication errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication failed';
    isOperational = true;
    category = ErrorCategory.AUTHENTICATION;
  }

  // Handle authorization errors
  if (error.name === 'UnauthorizedError') {
    statusCode = 403;
    message = 'Access denied';
    isOperational = true;
    category = ErrorCategory.AUTHORIZATION;
  }

  // Handle rate limiting errors
  if (error.message && error.message.includes('Too many requests')) {
    statusCode = 429;
    message = 'Too many requests';
    isOperational = true;
    category = ErrorCategory.RATE_LIMIT;
  }

  // Handle not found errors
  if (error.message && error.message.includes('not found')) {
    statusCode = 404;
    message = error.message;
    isOperational = true;
    category = ErrorCategory.NOT_FOUND;
  }

  // Handle conflict errors
  if (error.message && (
    error.message.includes('already exists') ||
    error.message.includes('already in') ||
    error.message.includes('full')
  )) {
    statusCode = 409;
    message = error.message;
    isOperational = true;
    category = ErrorCategory.CONFLICT;
  }

  // Log error details
  const errorLog = {
    message: error.message,
    stack: error.stack,
    statusCode,
    isOperational,
    category,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  };

  // Log based on error severity
  if (statusCode >= 500) {
    console.error('🚨 CRITICAL ERROR:', errorLog);
  } else if (statusCode >= 400) {
    console.warn('⚠️  CLIENT ERROR:', errorLog);
  } else {
    console.log('ℹ️  INFO ERROR:', errorLog);
  }

  // Send error response
  const errorResponse: ApiError = {
    error: getErrorType(statusCode),
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string || undefined,
    path: req.path
  };

  // Add additional context in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.category = category;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Get error type based on status code
 */
function getErrorType(statusCode: number): string {
  if (statusCode >= 500) return 'Internal Server Error';
  if (statusCode === 404) return 'Not Found';
  if (statusCode === 403) return 'Forbidden';
  if (statusCode === 401) return 'Unauthorized';
  if (statusCode === 400) return 'Bad Request';
  if (statusCode === 409) return 'Conflict';
  if (statusCode === 429) return 'Too Many Requests';
  return 'Error';
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create a custom error
 */
export const createError = (message: string, statusCode: number, isOperational: boolean = true): AppError => {
  return new AppError(message, statusCode, isOperational);
};

/**
 * Validation error helper
 */
export const createValidationError = (message: string): AppError => {
  return new AppError(message, 400, true);
};

/**
 * Not found error helper
 */
export const createNotFoundError = (message: string): AppError => {
  return new AppError(message, 404, true);
};

/**
 * Conflict error helper
 */
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409, true);
};

/**
 * Unauthorized error helper
 */
export const createUnauthorizedError = (message: string): AppError => {
  return new AppError(message, 401, true);
};

/**
 * Forbidden error helper
 */
export const createForbiddenError = (message: string): AppError => {
  return new AppError(message, 403, true);
};

/**
 * Rate limit error helper
 */
export const createRateLimitError = (message: string): AppError => {
  return new AppError(message, 429, true);
};
