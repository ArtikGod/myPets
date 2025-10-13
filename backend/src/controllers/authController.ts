import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse, LoginRequest, RegisterRequest, TelegramUserData } from '../types';
import { authService } from '../services/authService';
import { validateRequest, loginSchema, registerSchema, telegramUserSchema } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS, COOKIE_CONFIG } from '../constants';

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = validateRequest(registerSchema, req.body) as RegisterRequest;
  
  const { user, token } = await authService.register(validatedData);

  res.cookie('token', token, COOKIE_CONFIG);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: { user, token },
    message: 'Пользователь успешно зарегистрирован',
  } as ApiResponse);
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = validateRequest(loginSchema, req.body) as LoginRequest;
  
  const { user, token } = await authService.login(validatedData);

  res.cookie('token', token, COOKIE_CONFIG);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { user, token },
    message: 'Успешная авторизация',
  } as ApiResponse);
});

export const registerTelegramUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const validatedData = validateRequest(telegramUserSchema, req.body) as TelegramUserData;
  
  const { user, token } = await authService.registerTelegramUser(validatedData);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: { user, token },
    message: 'Telegram пользователь успешно зарегистрирован',
  } as ApiResponse);
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('token');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Успешный выход из системы',
  } as ApiResponse);
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { user: req.user },
  } as ApiResponse);
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { locale, timezone } = req.body;

  if (locale) {
    await authService.updateUserLocale(req.user.id, locale);
  }

  if (timezone) {
    await authService.updateUserTimezone(req.user.id, timezone);
  }

  const updatedUser = await authService.getUserById(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { user: updatedUser },
    message: 'Профиль успешно обновлен',
  } as ApiResponse);
});

export const refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { generateToken } = await import('../utils/auth');
  
  const newToken = generateToken({
    userId: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });

  res.cookie('token', newToken, COOKIE_CONFIG);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { token: newToken },
    message: 'Токен успешно обновлен',
  } as ApiResponse);
});