import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoRent API',
      version: '1.0.0',
      description: 'API для системы аренды автомобилей',
      contact: {
        name: 'API Support',
        email: 'support@autorent.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3200}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        Authorization: {
          type: 'apiKey',
          in: 'header',
          name: 'authorization',
          description: 'User ID для авторизации (24 символа MongoDB ObjectId)'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Уникальный идентификатор пользователя',
              example: '507f1f77bcf86cd799439011'
            },
            username: {
              type: 'string',
              description: 'Имя пользователя',
              maxLength: 50,
              example: 'john_doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя',
              example: 'john@example.com'
            },
            password: {
              type: 'string',
              description: 'Пароль пользователя',
              example: 'password123'
            },
            licens: {
              type: 'array',
              description: 'Водительские удостоверения',
              items: {
                type: 'object',
                properties: {
                  numberLicens: {
                    type: 'number',
                    description: 'Номер водительского удостоверения (10 цифр)',
                    example: 1234567890
                  },
                  dateRelease: {
                    type: 'string',
                    format: 'date',
                    description: 'Дата выдачи',
                    example: '2020-01-15'
                  },
                  dateValidity: {
                    type: 'string',
                    format: 'date',
                    description: 'Дата окончания действия',
                    example: '2030-01-15'
                  }
                }
              }
            },
            isAdmin: {
              type: 'boolean',
              description: 'Является ли пользователь администратором',
              default: false
            }
          }
        },
        Vehicle: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Уникальный идентификатор автомобиля',
              example: '507f1f77bcf86cd799439012'
            },
            make: {
              type: 'string',
              description: 'Марка автомобиля',
              example: 'Toyota'
            },
            model: {
              type: 'string',
              description: 'Модель автомобиля',
              example: 'Camry'
            },
            year: {
              type: 'number',
              description: 'Год выпуска',
              minimum: 1900,
              maximum: 2025,
              example: 2022
            },
            price: {
              type: 'number',
              description: 'Цена аренды за день',
              minimum: 0,
              example: 2500.50
            },
            photo: {
              type: 'string',
              description: 'URL фотографии автомобиля',
              example: 'https://example.com/car.jpg'
            }
          }
        },
        Reservation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Уникальный идентификатор бронирования',
              example: '507f1f77bcf86cd799439013'
            },
            vehicleId: {
              type: 'string',
              description: 'ID автомобиля',
              example: '507f1f77bcf86cd799439012'
            },
            userId: {
              type: 'string',
              description: 'ID пользователя',
              example: '507f1f77bcf86cd799439011'
            },
            leaseStart: {
              type: 'string',
              format: 'date',
              description: 'Дата начала аренды',
              example: '2024-01-15'
            },
            leaseEnd: {
              type: 'string',
              format: 'date',
              description: 'Дата окончания аренды',
              example: '2024-01-20'
            },
            price: {
              type: 'number',
              description: 'Общая стоимость аренды',
              default: 2000,
              example: 12500.00
            },
            status: {
              type: 'string',
              enum: ['Done', 'Canceled', 'Completed'],
              description: 'Статус бронирования',
              default: 'Done',
              example: 'Done'
            },
            userTgId: {
              type: 'number',
              description: 'Telegram ID пользователя (опционально)',
              example: 123456789
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Описание ошибки',
              example: 'Validation failed'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string',
                    example: 'Invalid value'
                  },
                  param: {
                    type: 'string',
                    example: 'email'
                  },
                  location: {
                    type: 'string',
                    example: 'body'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        Authorization: []
      }
    ]
  },
  apis: ['./src/**/*.ts'] // Путь к файлам с JSDoc комментариями
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AutoRent API Documentation'
  }));
};

export { specs };