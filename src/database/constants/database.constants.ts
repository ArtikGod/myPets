export const DATABASE_CONSTANTS = {
  DIALECT: 'postgres' as const,
  ENV: {
    HOST: 'DB_HOST',
    PORT: 'DB_PORT',
    USERNAME: 'DB_USERNAME',
    PASSWORD: 'DB_PASSWORD',
    NAME: 'DB_NAME',
    NODE_ENV: 'NODE_ENV',
  },
  DEFAULTS: {
    HOST: 'localhost',
    PORT: 5432,
  },
  OPTIONS: {
    AUTOLOAD_MODELS: true,
    SYNCHRONIZE: true,
  },
  NODE_ENV: {
    DEVELOPMENT: 'development',
  },
};