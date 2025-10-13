import Joi from 'joi';
import { SUPPORTED_LOCALES } from '../constants';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Имя должно содержать минимум 2 символа',
    'string.max': 'Имя не должно превышать 50 символов',
    'any.required': 'Имя обязательно для заполнения',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный формат email',
    'any.required': 'Email обязателен для заполнения',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Пароль должен содержать минимум 6 символов',
    'string.max': 'Пароль не должен превышать 100 символов',
    'any.required': 'Пароль обязателен для заполнения',
  }),
  locale: Joi.string().valid(...SUPPORTED_LOCALES).optional().default('ru'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный формат email',
    'any.required': 'Email обязателен для заполнения',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Пароль обязателен для заполнения',
  }),
});

export const telegramUserSchema = Joi.object({
  telegramId: Joi.string().required().messages({
    'any.required': 'Telegram ID обязателен',
  }),
  name: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Имя не может быть пустым',
    'string.max': 'Имя не должно превышать 50 символов',
    'any.required': 'Имя обязательно для заполнения',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный формат email',
    'any.required': 'Email обязателен для заполнения',
  }),
  locale: Joi.string().valid(...SUPPORTED_LOCALES).optional().default('ru'),
});

export const exerciseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Название должно содержать минимум 3 символа',
    'string.max': 'Название не должно превышать 200 символов',
    'any.required': 'Название обязательно для заполнения',
  }),
  titleEn: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Описание должно содержать минимум 10 символов',
    'string.max': 'Описание не должно превышать 2000 символов',
    'any.required': 'Описание обязательно для заполнения',
  }),
  descriptionEn: Joi.string().min(10).max(2000).optional(),
  category: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Категория должна содержать минимум 2 символа',
    'string.max': 'Категория не должна превышать 50 символов',
    'any.required': 'Категория обязательна для заполнения',
  }),
  categoryEn: Joi.string().min(2).max(50).optional(),
  order: Joi.number().integer().min(1).optional(),
  isActive: Joi.boolean().optional().default(true),
});

export const customTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Название должно содержать минимум 3 символа',
    'string.max': 'Название не должно превышать 200 символов',
    'any.required': 'Название обязательно для заполнения',
  }),
  titleEn: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Описание должно содержать минимум 10 символов',
    'string.max': 'Описание не должно превышать 2000 символов',
    'any.required': 'Описание обязательно для заполнения',
  }),
  descriptionEn: Joi.string().min(10).max(2000).optional(),
  isActive: Joi.boolean().optional().default(true),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
});

export const taskQuerySchema = paginationSchema.keys({
  status: Joi.string().valid('PENDING', 'COMPLETED', 'SKIPPED').optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
});

export const exerciseQuerySchema = paginationSchema.keys({
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const userQuerySchema = paginationSchema.keys({
  role: Joi.string().valid('USER', 'ADMIN').optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().min(1).max(100).optional(),
});

export const aiGenerateSchema = Joi.object({
  category: Joi.string().min(2).max(50).optional(),
  locale: Joi.string().valid(...SUPPORTED_LOCALES).optional().default('ru'),
  prompt: Joi.string().min(10).max(500).optional(),
});

export const idParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'ID обязателен',
  }),
});

export const validateRequest = <T>(schema: Joi.ObjectSchema<T>, data: any): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    
    const validationError = new Error('Validation failed');
    (validationError as any).validationErrors = validationErrors;
    throw validationError;
  }
  
  return value;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidTelegramId = (telegramId: string): boolean => {
  const telegramIdRegex = /^\d+$/;
  return telegramIdRegex.test(telegramId) && telegramId.length >= 5;
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};