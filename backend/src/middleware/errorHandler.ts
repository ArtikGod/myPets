import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ApiResponse, ErrorResponse, ValidationError } from '../types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { isDevelopment } from '../utils/config';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleValidationError = (error: any): ErrorResponse => {
  const validationErrors: ValidationError[] = error.validationErrors || [];
  
  return {
    success: false,
    error: ERROR_MESSAGES.VALIDATION_ERROR,
    message: 'Проверьте правильность введенных данных',
    details: validationErrors,
  };
};

export const handlePrismaError = (error: PrismaClientKnownRequestError): ErrorResponse => {
  switch (error.code) {
    case 'P2002':
      const field = error.meta?.target as string[] | undefined;
      const fieldName = field?.[0] || 'поле';
      return {
        success: false,
        error: ERROR_MESSAGES.USER_ALREADY_EXISTS,
        message: `Значение ${fieldName} уже используется`,
      };
    
    case 'P2025':
      return {
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        message: 'Запрашиваемая запись не найдена',
      };
    
    case 'P2003':
      return {
        success: false,
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: 'Нарушение связи между записями',
      };
    
    case 'P2014':
      return {
        success: false,
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: 'Изменение нарушает связанные записи',
      };
    
    default:
      return {
        success: false,
        error: ERROR_MESSAGES.INTERNAL_ERROR,
        message: 'Ошибка базы данных',
      };
  }
};

export const handleJWTError = (error: Error): ErrorResponse => {
  if (error.message.includes('expired')) {
    return {
      success: false,
      error: ERROR_MESSAGES.TOKEN_EXPIRED,
      message: 'Токен истек, необходимо войти заново',
    };
  }
  
  return {
    success: false,
    error: ERROR_MESSAGES.INVALID_TOKEN,
    message: 'Недействительный токен авторизации',
  };
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let errorResponse: ErrorResponse;

  if (error.name === 'ValidationError' || (error as any).validationErrors) {
    errorResponse = handleValidationError(error);
    res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
    return;
  }

  if (error instanceof PrismaClientKnownRequestError) {
    errorResponse = handlePrismaError(error);
    res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
    return;
  }

  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    errorResponse = handleJWTError(error);
    res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse);
    return;
  }

  if (error instanceof AppError) {
    errorResponse = {
      success: false,
      error: error.message,
      message: error.message,
    };
    res.status(error.statusCode).json(errorResponse);
    return;
  }

  console.error('Необработанная ошибка:', error);

  errorResponse = {
    success: false,
    error: ERROR_MESSAGES.INTERNAL_ERROR,
    message: isDevelopment ? error.message : 'Внутренняя ошибка сервера',
  };

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: ERROR_MESSAGES.NOT_FOUND,
    message: `Маршрут ${req.originalUrl} не найден`,
  };

  res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST): AppError => {
  return new AppError(message, statusCode);
};