export const VALIDATION = {
  PRODUCT: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
    DESCRIPTION: {
      MAX_LENGTH: 1000,
    },
    PRICE: {
      MIN: 0,
    },
  },
  CATEGORY: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
    },
  },
} as const;

export const VALIDATION_MESSAGES = {
  PRODUCT: {
    NAME_LENGTH: 'Product name must be between 2 and 100 characters',
    DESCRIPTION_LENGTH: 'Product description must not exceed 1000 characters',
    PRICE_NEGATIVE: 'Product price cannot be negative',
  },
  CATEGORY: {
    NAME_LENGTH: 'Category name must be between 2 and 100 characters',
  },
} as const; 