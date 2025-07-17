import httpStatus from 'http-status';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(
      httpStatus.NOT_FOUND,
      message,
      'NOT_FOUND'
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      httpStatus.BAD_REQUEST,
      message,
      'VALIDATION_ERROR',
      details
    );
  }
}

export class CategoryDepthError extends AppError {
  constructor() {
    super(
      httpStatus.BAD_REQUEST,
      ERROR_MESSAGES.CATEGORY.MAX_DEPTH_EXCEEDED,
      'MAX_DEPTH_EXCEEDED'
    );
  }
}

export class CategoryHasProductsError extends AppError {
  constructor() {
    super(
      httpStatus.CONFLICT,
      ERROR_MESSAGES.CATEGORY.HAS_PRODUCTS,
      'CATEGORY_HAS_PRODUCTS'
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(
      httpStatus.INTERNAL_SERVER_ERROR,
      message,
      'DATABASE_ERROR',
      details
    );
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, code: string) {
    super(
      httpStatus.BAD_REQUEST,
      message,
      code
    );
  }
}

export class InvalidPriceError extends BusinessLogicError {
  constructor() {
    super(
      ERROR_MESSAGES.PRODUCT.INVALID_PRICE,
      'INVALID_PRICE'
    );
  }
} 