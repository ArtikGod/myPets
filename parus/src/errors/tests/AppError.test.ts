import httpStatus from 'http-status';
import {
  AppError,
  NotFoundError,
  ValidationError,
  CategoryDepthError,
  CategoryHasProductsError,
  DatabaseError,
  BusinessLogicError,
  InvalidPriceError
} from '../AppError';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/errorMessages';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError instance with correct properties', () => {
      const error = new AppError(httpStatus.BAD_REQUEST, 'Test error', 'TEST_ERROR', { detail: 'test' });
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ detail: 'test' });
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError instance with correct properties', () => {
      const error = new NotFoundError('Resource not found');
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(httpStatus.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError instance with correct properties', () => {
      const details = { field: 'name', error: 'required' };
      const error = new ValidationError('Validation failed', details);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
    });
  });

  describe('CategoryDepthError', () => {
    it('should create a CategoryDepthError instance with correct properties', () => {
      const error = new CategoryDepthError();
      expect(error).toBeInstanceOf(CategoryDepthError);
      expect(error.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(error.message).toBe(ERROR_MESSAGES.CATEGORY.MAX_DEPTH_EXCEEDED);
      expect(error.code).toBe('MAX_DEPTH_EXCEEDED');
    });
  });

  describe('CategoryHasProductsError', () => {
    it('should create a CategoryHasProductsError instance with correct properties', () => {
      const error = new CategoryHasProductsError();
      expect(error).toBeInstanceOf(CategoryHasProductsError);
      expect(error.statusCode).toBe(httpStatus.CONFLICT);
      expect(error.message).toBe(ERROR_MESSAGES.CATEGORY.HAS_PRODUCTS);
      expect(error.code).toBe('CATEGORY_HAS_PRODUCTS');
    });
  });

  describe('DatabaseError', () => {
    it('should create a DatabaseError instance with correct properties', () => {
      const details = { sql: 'SELECT * FROM users' };
      const error = new DatabaseError('Database connection failed', details);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.statusCode).toBe(httpStatus.INTERNAL_SERVER_ERROR);
      expect(error.message).toBe('Database connection failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.details).toEqual(details);
    });
  });

  describe('BusinessLogicError', () => {
    it('should create a BusinessLogicError instance with correct properties', () => {
      const error = new BusinessLogicError('Invalid operation', 'INVALID_OP');
      expect(error).toBeInstanceOf(BusinessLogicError);
      expect(error.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(error.message).toBe('Invalid operation');
      expect(error.code).toBe('INVALID_OP');
    });
  });

  describe('InvalidPriceError', () => {
    it('should create an InvalidPriceError instance with correct properties', () => {
      const error = new InvalidPriceError();
      expect(error).toBeInstanceOf(InvalidPriceError);
      expect(error.statusCode).toBe(httpStatus.BAD_REQUEST);
      expect(error.message).toBe(ERROR_MESSAGES.PRODUCT.INVALID_PRICE);
      expect(error.code).toBe('INVALID_PRICE');
    });
  });
});

describe('Error Messages', () => {
  describe('ERROR_MESSAGES', () => {
    it('should have correct category error messages', () => {
      expect(ERROR_MESSAGES.CATEGORY.NOT_FOUND).toBe('Category not found');
      expect(ERROR_MESSAGES.CATEGORY.MAX_DEPTH_EXCEEDED).toBe('Maximum category depth (3) exceeded');
      expect(ERROR_MESSAGES.CATEGORY.PARENT_NOT_FOUND).toBe('Parent category not found');
      expect(ERROR_MESSAGES.CATEGORY.HAS_PRODUCTS).toBe('Cannot delete category with active products');
    });

    it('should have correct product error messages', () => {
      expect(ERROR_MESSAGES.PRODUCT.NOT_FOUND).toBe('Product not found');
      expect(ERROR_MESSAGES.PRODUCT.INVALID_PRICE).toBe('Product price must be greater than zero');
      expect(ERROR_MESSAGES.PRODUCT.INVALID_CATEGORY).toBe('Invalid category for product');
    });

    it('should have correct validation error messages', () => {
      expect(ERROR_MESSAGES.VALIDATION.INVALID_REQUEST).toBe('Invalid request data');
      expect(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD('name')).toBe('name is required');
      expect(ERROR_MESSAGES.VALIDATION.INVALID_LENGTH('name', 3, 50))
        .toBe('name length must be between 3 and 50 characters');
    });

    it('should have correct database error messages', () => {
      expect(ERROR_MESSAGES.DATABASE.CONNECTION_ERROR).toBe('Database connection error');
      expect(ERROR_MESSAGES.DATABASE.QUERY_ERROR).toBe('Database query error');
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    it('should have correct success messages', () => {
      expect(SUCCESS_MESSAGES.DATABASE_CONNECTED).toBe('Database connection successful');
      expect(SUCCESS_MESSAGES.SERVER_STARTED(3000)).toBe('Server is running on port 3000');
      expect(SUCCESS_MESSAGES.SWAGGER_AVAILABLE(3000))
        .toBe('Swagger documentation available at http://localhost:3000/docs');
    });
  });
}); 