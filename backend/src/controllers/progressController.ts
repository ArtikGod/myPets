import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse, ProgressStats, TaskStatus, Task, Exercise, UserProgress } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import prisma from '../utils/database';

export const getProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    } as ApiResponse);
    return;
  }

  const userId = req.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 7);
  
  const monthStart = new Date(today);
  monthStart.setDate(today.getDate() - 30);

  const todayProgress = await prisma.userProgress.findFirst({
    where: {
      userId,
      date: today,
    },
  });

  const todayTasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  const todayTasksReceived = todayTasks.length;
  const todayTasksCompleted = todayTasks.filter((task: any) => task.status === 'COMPLETED').length;
  const todayCompletionRate = todayTasksReceived > 0 ? Math.round((todayTasksCompleted / todayTasksReceived) * 100) : 0;

  const weekTasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: weekStart,
      },
    },
  });

  const weekTasksReceived = weekTasks.length;
  const weekTasksCompleted = weekTasks.filter((task: any) => task.status === 'COMPLETED').length;
  const weekCompletionRate = weekTasksReceived > 0 ? Math.round((weekTasksCompleted / weekTasksReceived) * 100) : 0;

  const monthTasks = await prisma.task.findMany({
    where: {
      userId,
      date: {
        gte: monthStart,
      },
    },
  });

  const monthTasksReceived = monthTasks.length;
  const monthTasksCompleted = monthTasks.filter((task: any) => task.status === 'COMPLETED').length;
  const monthCompletionRate = monthTasksReceived > 0 ? Math.round((monthTasksCompleted / monthTasksReceived) * 100) : 0;

  const totalTasks = await prisma.task.findMany({
    where: { userId },
  });

  const totalTasksReceived = totalTasks.length;
  const totalTasksCompleted = totalTasks.filter((task: any) => task.status === 'COMPLETED').length;
  const totalCompletionRate = totalTasksReceived > 0 ? Math.round((totalTasksCompleted / totalTasksReceived) * 100) : 0;

  const currentStreak = todayProgress?.streak || 0;

  const longestStreakRecord = await prisma.userProgress.findFirst({
    where: { userId },
    orderBy: { streak: 'desc' },
  });
  const longestStreak = longestStreakRecord?.streak || 0;

  const progressStats: ProgressStats = {
    today: {
      tasksReceived: todayTasksReceived,
      tasksCompleted: todayTasksCompleted,
      completionRate: todayCompletionRate,
    },
    week: {
      tasksReceived: weekTasksReceived,
      tasksCompleted: weekTasksCompleted,
      completionRate: weekCompletionRate,
      streak: currentStreak,
    },
    month: {
      tasksReceived: monthTasksReceived,
      tasksCompleted: monthTasksCompleted,
      completionRate: monthCompletionRate,
    },
    total: {
      tasksReceived: totalTasksReceived,
      tasksCompleted: totalTasksCompleted,
      completionRate: totalCompletionRate,
      longestStreak,
    },
  };

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      ...progressStats,
      currentStreak,
    },
  } as ApiResponse);
});

export const getProgressChart = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    } as ApiResponse);
    return;
  }

  const userId = req.user.id;
  const period = req.query.period as string || 'month';
  
  let startDate: Date;
  const endDate = new Date();
  
  switch (period) {
    case 'week':
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    default:
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
  }

  const progressData = await prisma.userProgress.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });

  const chartData = progressData.map((progress: any) => ({
    date: progress.date.toISOString().split('T')[0],
    tasksReceived: progress.tasksReceived,
    tasksCompleted: progress.tasksCompleted,
    completionRate: progress.tasksReceived > 0 
      ? Math.round((progress.tasksCompleted / progress.tasksReceived) * 100) 
      : 0,
    streak: progress.streak,
  }));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: chartData,
  } as ApiResponse);
});

export const getProgressStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    } as ApiResponse);
    return;
  }

  const userId = req.user.id;

  const [totalTasks, completedTasks, longestStreakRecord] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.userProgress.findFirst({
      where: { userId },
      orderBy: { streak: 'desc' },
    }),
  ]);

  const averageCompletionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const longestStreak = longestStreakRecord?.streak || 0;

  const categoryStats = await prisma.task.groupBy({
    by: ['exerciseId'],
    where: { userId },
    _count: {
      id: true,
    },
  });

  const exerciseIds = categoryStats.map((stat: { exerciseId: string }) => stat.exerciseId);
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, category: true, title: true },
  });

  const categoryStatsWithDetails = categoryStats.map((stat: { exerciseId: string; _count: { id: number } }) => {
    const exercise = exercises.find((ex: any) => ex.id === stat.exerciseId);
    return {
      category: exercise?.category || 'unknown',
      title: exercise?.title || 'Unknown Exercise',
      totalTasks: stat._count.id,
    };
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      totalTasks,
      completedTasks,
      averageCompletionRate,
      longestStreak,
      categoryStats: categoryStatsWithDetails,
    },
  } as ApiResponse);
});