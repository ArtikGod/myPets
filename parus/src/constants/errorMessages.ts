import httpStatus from 'http-status';

export const ERROR_MESSAGES = {
  CATEGORY: {
    NOT_FOUND: 'Category not found',
    MAX_DEPTH_EXCEEDED: `Maximum category depth (3) exceeded`,
    PARENT_NOT_FOUND: 'Parent category not found',
    HAS_PRODUCTS: 'Cannot delete category with active products',
  },
  PRODUCT: {
    NOT_FOUND: 'Product not found',
    INVALID_PRICE: 'Product price must be greater than zero',
    INVALID_CATEGORY: 'Invalid category for product',
  },
  VALIDATION: {
    INVALID_REQUEST: 'Invalid request data',
    REQUIRED_FIELD: (field: string) => `${field} is required`,
    INVALID_LENGTH: (field: string, min: number, max: number) => 
      `${field} length must be between ${min} and ${max} characters`,
  },
  DATABASE: {
    CONNECTION_ERROR: 'Database connection error',
    QUERY_ERROR: 'Database query error',
  },
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;

export const SUCCESS_MESSAGES = {
  DATABASE_CONNECTED: 'Database connection successful',
  SERVER_STARTED: (port: number) => `Server is running on port ${port}`,
  SWAGGER_AVAILABLE: (port: number) => `Swagger documentation available at http://localhost:${port}/docs`,
} as const; 