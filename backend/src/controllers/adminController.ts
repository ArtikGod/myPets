import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, AdminStats } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS, API_MESSAGES, ERROR_MESSAGES } from '../constants';
import prisma from '../utils/database';

export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const isActive = req.query.isActive as string;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  } as ApiResponse);
});

export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      locale: true,
      timezone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          tasks: true,
          customTasks: true,
        },
      },
    },
  });

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: ERROR_MESSAGES.USER_NOT_FOUND,
    } as ApiResponse);
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user,
  } as ApiResponse);
});

export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const { id } = req.params;
  const { name, email, role, locale, timezone, isActive } = req.body;

  // Валидация email
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
    } as ApiResponse);
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: ERROR_MESSAGES.USER_NOT_FOUND,
    } as ApiResponse);
    return;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role,
      locale,
      timezone,
      isActive,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      locale: true,
      timezone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updatedUser,
    message: API_MESSAGES.SUCCESS.USER_UPDATED,
  } as ApiResponse);
});

export const getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  const dateFilter = startDate && endDate ? {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  } : {};

  const [
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    totalExercises,
    activeExercises,
    totalTasks,
    completedTasks,
    pendingTasks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.exercise.count(),
    prisma.exercise.count({ where: { isActive: true } }),
    prisma.task.count(startDate && endDate ? { where: dateFilter } : undefined),
    prisma.task.count({
      where: {
        status: 'COMPLETED',
        ...(startDate && endDate ? dateFilter : {}),
      },
    }),
    prisma.task.count({
      where: {
        status: 'PENDING',
        ...(startDate && endDate ? dateFilter : {}),
      },
    }),
  ]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const stats: AdminStats = {
    users: {
      total: totalUsers,
      active: activeUsers,
      new: newUsersThisMonth,
      newThisMonth: newUsersThisMonth,
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      completionRate,
    },
    exercises: {
      total: totalExercises,
      active: activeExercises,
    },
    completionRate,
  };

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: stats,
  } as ApiResponse);
});

export const getExercises = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const category = req.query.category as string;
  const search = req.query.search as string;

  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [exercises, total] = await Promise.all([
    prisma.exercise.findMany({
      where,
      orderBy: { order: 'asc' },
      skip,
      take: limit,
    }),
    prisma.exercise.count({ where }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  } as ApiResponse);
});

export const createExercise = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const { title, titleEn, description, descriptionEn, category, categoryEn, order } = req.body;

  if (!title || !description || !category) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
    } as ApiResponse);
    return;
  }

  const exercise = await prisma.exercise.create({
    data: {
      title,
      titleEn,
      description,
      descriptionEn,
      category,
      categoryEn,
      order: order || 0,
    },
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: exercise,
    message: API_MESSAGES.SUCCESS.EXERCISE_CREATED,
  } as ApiResponse);
});

export const updateExercise = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const { id } = req.params;
  const { title, titleEn, description, descriptionEn, category, categoryEn, order, isActive } = req.body;

  const existingExercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!existingExercise) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: ERROR_MESSAGES.EXERCISE_NOT_FOUND,
    } as ApiResponse);
    return;
  }

  const updatedExercise = await prisma.exercise.update({
    where: { id },
    data: {
      title,
      titleEn,
      description,
      descriptionEn,
      category,
      categoryEn,
      order,
      isActive,
    },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updatedExercise,
    message: API_MESSAGES.SUCCESS.EXERCISE_UPDATED,
  } as ApiResponse);
});

export const deleteExercise = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.ADMIN_REQUIRED,
    } as ApiResponse);
    return;
  }

  const { id } = req.params;

  const existingExercise = await prisma.exercise.findUnique({
    where: { id },
  });

  if (!existingExercise) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: ERROR_MESSAGES.EXERCISE_NOT_FOUND,
    } as ApiResponse);
    return;
  }

  await prisma.exercise.delete({
    where: { id },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: API_MESSAGES.SUCCESS.EXERCISE_DELETED,
  } as ApiResponse);
});