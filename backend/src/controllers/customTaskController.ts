import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS, API_MESSAGES } from '../constants';
import prisma from '../utils/database';

export const createCustomTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { title, description, titleEn, descriptionEn } = req.body;

  if (!title || !description) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Title and description are required',
    } as ApiResponse);
    return;
  }

  if (title.length > 255) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Title is too long',
    } as ApiResponse);
    return;
  }

  const customTask = await prisma.customTask.create({
    data: {
      userId: req.user.id,
      title,
      description,
      titleEn,
      descriptionEn,
    },
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: customTask,
    message: API_MESSAGES.SUCCESS.CUSTOM_TASK_CREATED,
  } as ApiResponse);
});

export const getUserCustomTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const where: any = { userId: req.user.id };

  if (req.query.isActive !== undefined) {
    where.isActive = req.query.isActive === 'true';
  }

  const [customTasks, total] = await Promise.all([
    prisma.customTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.customTask.count({ where }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      tasks: customTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  } as ApiResponse);
});

export const updateCustomTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = req.params;
  const { title, description, titleEn, descriptionEn, isActive } = req.body;

  if (title !== undefined && (!title || title.length === 0)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Title cannot be empty',
    } as ApiResponse);
    return;
  }

  if (title && title.length > 255) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: 'Title is too long',
    } as ApiResponse);
    return;
  }

  const customTask = await prisma.customTask.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!customTask) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Пользовательское задание не найдено',
    } as ApiResponse);
    return;
  }

  const updatedTask = await prisma.customTask.update({
    where: { id },
    data: {
      title,
      description,
      titleEn,
      descriptionEn,
      isActive,
    },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updatedTask,
    message: 'Пользовательское задание обновлено',
  } as ApiResponse);
});

export const deleteCustomTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = req.params;

  const customTask = await prisma.customTask.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!customTask) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Пользовательское задание не найдено',
    } as ApiResponse);
    return;
  }

  await prisma.customTask.delete({
    where: { id },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Пользовательское задание удалено',
  } as ApiResponse);
});

export const completeCustomTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = req.params;

  const customTask = await prisma.customTask.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!customTask) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Пользовательское задание не найдено',
    } as ApiResponse);
    return;
  }

  const updatedTask = await prisma.customTask.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { customTask: updatedTask },
    message: 'Пользовательское задание выполнено',
  } as ApiResponse);
});

export const getCustomTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = req.params;

  const customTask = await prisma.customTask.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!customTask) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Пользовательское задание не найдено',
    } as ApiResponse);
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: customTask,
  } as ApiResponse);
});

export const toggleCustomTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = req.params;

  const customTask = await prisma.customTask.findFirst({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!customTask) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Пользовательское задание не найдено',
    } as ApiResponse);
    return;
  }

  const updatedTask = await prisma.customTask.update({
    where: { id },
    data: {
      isActive: !customTask.isActive,
    },
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: updatedTask,
    message: `Задание ${updatedTask.isActive ? 'активировано' : 'деактивировано'}`,
  } as ApiResponse);
});