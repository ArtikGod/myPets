import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, TaskQuery } from '../types';
import { taskService } from '../services/taskService';
import { validateRequest, taskQuerySchema, idParamSchema } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../constants';

export const getTodayTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const task = await taskService.getTodayTask(req.user.id);

  if (!task) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Задание на сегодня не найдено',
      message: 'Возможно, все упражнения неактивны',
    } as ApiResponse);
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { task },
    message: 'Задание на сегодня получено',
  } as ApiResponse);
});

export const completeTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = validateRequest(idParamSchema, req.params);
  
  const task = await taskService.completeTask(id, req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { task },
    message: 'Задание отмечено как выполненное',
  } as ApiResponse);
});

export const getTaskHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const query = validateRequest(taskQuerySchema, req.query) as TaskQuery;
  
  const result = await taskService.getTaskHistory(req.user.id, query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result.tasks,
    pagination: result.pagination,
    message: 'История заданий получена',
  } as ApiResponse);
});

export const getUserProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const progress = await taskService.getUserProgress(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { progress },
    message: 'Прогресс пользователя получен',
  } as ApiResponse);
});

export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = validateRequest(idParamSchema, req.params);

  const task = await taskService.getTaskById(id, req.user.id);

  if (!task) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      error: 'Задание не найдено',
    } as ApiResponse);
    return;
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { task },
  } as ApiResponse);
});

export const skipTask = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: 'Пользователь не авторизован',
    } as ApiResponse);
    return;
  }

  const { id } = validateRequest(idParamSchema, req.params);
  
  const task = await taskService.skipTask(id, req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { task },
    message: 'Задание пропущено',
  } as ApiResponse);
});