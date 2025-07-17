export const DATABASE = {
  TABLES: {
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
  },
  FIELDS: {
    ID: 'id',
    NAME: 'name',
    PARENT_ID: 'parent_id',
    LEVEL: 'level',
    IS_ACTIVE: 'is_active',
    DESCRIPTION: 'description',
    PRICE: 'price',
    CATEGORY_ID: 'category_id',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
  },
  CONSTRAINTS: {
    DECIMAL_PRECISION: 10,
    DECIMAL_SCALE: 2,
    MIN_POOL_SIZE: 2,
    MAX_POOL_SIZE: 10,
  },
  MIGRATIONS: {
    TABLE_NAME: 'knex_migrations',
  },
} as const; 