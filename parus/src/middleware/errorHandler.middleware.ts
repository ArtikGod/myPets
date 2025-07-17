import { Request, Response, NextFunction } from 'express';
import { ValidationError as ClassValidatorError } from 'class-validator';
import httpStatus from 'http-status';
import { AppError } from '../errors/AppError';
import { ERROR_MESSAGES } from '../constants/errorMessages';

interface ErrorResponse {
  status: string;
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

interface DatabaseError extends Error {
  code?: string;
  sqlMessage?: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[${new Date().toISOString()}] Error:`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  const response: ErrorResponse = {
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  if (err instanceof AppError) {
    response.code = err.code;
    response.message = err.message;
    if (err.details) {
      response.details = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  if (Array.isArray(err) && err[0] instanceof ClassValidatorError) {
    response.code = 'VALIDATION_ERROR';
    response.message = ERROR_MESSAGES.VALIDATION.INVALID_REQUEST;
    response.details = err.map(e => ({
      property: e.property,
      constraints: e.constraints,
      value: e.value
    }));
    return res.status(httpStatus.BAD_REQUEST).json(response);
  }

  const dbError = err as DatabaseError;
  if (dbError.code && dbError.sqlMessage) {
    response.code = 'DATABASE_ERROR';
    response.message = ERROR_MESSAGES.DATABASE.QUERY_ERROR;
    if (process.env.NODE_ENV === 'development') {
      response.details = {
        code: dbError.code,
        sqlMessage: dbError.sqlMessage,
      };
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response);
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json(response);
} 