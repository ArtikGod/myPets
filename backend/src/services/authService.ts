import { LoginRequest, RegisterRequest, TelegramUserData, ApiResponse } from '../types';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { validateRequest, registerSchema, loginSchema, telegramUserSchema } from '../utils/validation';
import { ERROR_MESSAGES, HTTP_STATUS, USER_ROLES } from '../constants';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/database';

type User = Awaited<ReturnType<typeof prisma.user.findFirst>>;

export class AuthService {
  async register(data: RegisterRequest): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const validatedData = validateRequest(registerSchema, data) as RegisterRequest;

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        locale: validatedData.locale || 'ru',
        role: USER_ROLES.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        isActive: true,
        telegramId: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async login(data: LoginRequest): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const validatedData = validateRequest(loginSchema, data) as LoginRequest;

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.password) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePassword(validatedData.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async registerTelegramUser(data: TelegramUserData): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const validatedData = validateRequest(telegramUserSchema, data) as TelegramUserData;

    const existingUserByTelegram = await prisma.user.findUnique({
      where: { telegramId: validatedData.telegramId },
    });

    if (existingUserByTelegram) {
      const token = generateToken({
        userId: existingUserByTelegram.id,
        email: existingUserByTelegram.email,
        role: existingUserByTelegram.role,
      });

      const { password, ...userWithoutPassword } = existingUserByTelegram;
      return { user: userWithoutPassword, token };
    }

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUserByEmail) {
      if (existingUserByEmail.telegramId) {
        throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      const updatedUser = await prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: { telegramId: validatedData.telegramId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          locale: true,
          isActive: true,
          telegramId: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const token = generateToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      return { user: updatedUser, token };
    }

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        telegramId: validatedData.telegramId,
        locale: validatedData.locale || 'ru',
        role: USER_ROLES.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        isActive: true,
        telegramId: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        isActive: true,
        telegramId: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserByTelegramId(telegramId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({
      where: { telegramId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        isActive: true,
        telegramId: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUserLocale(userId: string, locale: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { locale },
    });
  }

  async updateUserTimezone(userId: string, timezone: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { timezone },
    });
  }

  async deactivateUser(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async activateUser(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }
}

export const authService = new AuthService();