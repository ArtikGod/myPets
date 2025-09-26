export const APP_CONSTANTS = {
  SERVER: {
    DEFAULT_PORT: 3000,
    DEFAULT_CORS_ORIGIN: 'http://localhost:3000',
    API_PREFIX: 'api',
    DOCS_PATH: 'docs',
  },
  CORS: {
    DEFAULT_ORIGINS: ['http://localhost:3000'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  },
  VALIDATION: {
    WHITELIST: true,
    TRANSFORM: true,
  },
  SWAGGER: {
    TITLE: 'NestJS Server API',
    DESCRIPTION: 'API для сервера с аутентификацией, файлами и WebSockets',
    VERSION: '1.0',
    TAG: 'NestJS',
    PATH: 'api/docs',
  },
  MESSAGES: {
    SERVER_STARTED: 'Сервер запущен на порту',
    SWAGGER_DOCS: 'Swagger документация',
    SERVER_INFO: 'NestJS Server API работает!',
    HEALTH_CHECK: 'healthy',
  },
  FEATURES: [
    'REST API',
    'WebSockets',
    'JWT Authentication',
    'File Upload',
    'PostgreSQL Database',
    'Swagger Documentation',
  ],
};