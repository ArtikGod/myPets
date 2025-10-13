import { Request } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/database';

export type User = Awaited<ReturnType<typeof prisma.user.findFirst>>;
export type Task = Awaited<ReturnType<typeof prisma.task.findFirst>>;
export type Exercise = Awaited<ReturnType<typeof prisma.exercise.findFirst>>;
export type CustomTask = Awaited<ReturnType<typeof prisma.customTask.findFirst>>;
export type UserProgress = Awaited<ReturnType<typeof prisma.userProgress.findFirst>>;

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN'
} as const;

export const TaskStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED'
} as const;

export type Role = typeof Role[keyof typeof Role];
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface AuthenticatedRequest extends Request {
  user?: Omit<NonNullable<User>, 'password'>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  locale?: string;
}

export interface TelegramUserData {
  telegramId: string;
  name: string;
  email: string;
  locale?: string;
}

export interface TaskResponse {
  id: string;
  text: string;
  textEn?: string;
  date: Date;
  status: TaskStatus;
  completedAt?: Date;
  exercise: {
    id: string;
    title: string;
    titleEn?: string;
    category: string;
    categoryEn?: string;
  };
}

export interface ExerciseRequest {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: string;
  categoryEn?: string;
  order?: number;
  isActive?: boolean;
}

export interface CustomTaskRequest {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  isActive?: boolean;
}

export interface ProgressStats {
  today: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
  };
  week: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
    streak: number;
  };
  month: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
  };
  total: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
    longestStreak: number;
  };
}

export interface AIGenerateRequest {
  category?: string;
  locale?: string;
  prompt?: string;
}

export interface AIExerciseResponse {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: string;
  categoryEn?: string;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    new: number;
    newThisMonth: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  exercises: {
    total: number;
    active: number;
  };
  completionRate: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: ValidationError[];
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface TaskQuery extends PaginationQuery {
  status?: TaskStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExerciseQuery extends PaginationQuery {
  category?: string;
  isActive?: string;
}

export interface UserQuery extends PaginationQuery {
  role?: Role;
  isActive?: string;
  search?: string;
}

export type Locale = 'ru' | 'en';

export interface LocalizedContent {
  ru: string;
  en?: string;
}

export interface SchedulerConfig {
  time: string;
  timezone: string;
  enabled: boolean;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface TelegramConfig {
  token: string;
  webhookUrl?: string;
}

export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  database: DatabaseConfig;
  telegram?: TelegramConfig;
  email?: EmailConfig;
  scheduler: SchedulerConfig;
  cors: {
    origin: string;
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}