import { TaskResponse, ProgressStats, TaskQuery } from '../types';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/database';

import { TaskStatus } from '../types';

type Exercise = Awaited<ReturnType<typeof prisma.exercise.findFirst>>;
type User = Awaited<ReturnType<typeof prisma.user.findFirst>>;

export class TaskService {
  async getTodayTask(userId: string): Promise<TaskResponse | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingTask = await prisma.task.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
          },
        },
      },
    });

    if (existingTask) {
      return this.formatTaskResponse(existingTask);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { locale: true },
    });

    const nextExercise = await this.getNextExerciseForUser(userId);
    
    if (!nextExercise) {
      return null;
    }

    const newTask = await prisma.task.create({
      data: {
        userId,
        exerciseId: nextExercise.id,
        text: user?.locale === 'en' && nextExercise.descriptionEn 
          ? nextExercise.descriptionEn 
          : nextExercise.description,
        textEn: nextExercise.descriptionEn,
        date: today,
        status: TaskStatus.PENDING,
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
          },
        },
      },
    });

    return this.formatTaskResponse(newTask);
  }

  async completeTask(taskId: string, userId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(ERROR_MESSAGES.TASK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (task.status === TaskStatus.COMPLETED) {
      return this.formatTaskResponse(task);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
          },
        },
      },
    });

    await this.updateUserProgress(userId, new Date());

    return this.formatTaskResponse(updatedTask);
  }

  async getTaskHistory(userId: string, query: TaskQuery): Promise<{
    tasks: TaskResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) {
        where.date.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.date.lte = new Date(query.dateTo);
      }
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          exercise: {
            select: {
              id: true,
              title: true,
              titleEn: true,
              category: true,
              categoryEn: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks: tasks.map((task: any) => this.formatTaskResponse(task)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserProgress(userId: string): Promise<ProgressStats> {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayStats, weekStats, monthStats, totalStats] = await Promise.all([
      this.getStatsForPeriod(userId, today, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
      this.getStatsForPeriod(userId, weekStart, today),
      this.getStatsForPeriod(userId, monthStart, today),
      this.getStatsForPeriod(userId, new Date(0), now),
    ]);

    const streak = await this.calculateStreak(userId);
    const longestStreak = await this.calculateLongestStreak(userId);

    return {
      today: {
        tasksReceived: todayStats.received,
        tasksCompleted: todayStats.completed,
        completionRate: todayStats.received > 0 ? (todayStats.completed / todayStats.received) * 100 : 0,
      },
      week: {
        tasksReceived: weekStats.received,
        tasksCompleted: weekStats.completed,
        completionRate: weekStats.received > 0 ? (weekStats.completed / weekStats.received) * 100 : 0,
        streak,
      },
      month: {
        tasksReceived: monthStats.received,
        tasksCompleted: monthStats.completed,
        completionRate: monthStats.received > 0 ? (monthStats.completed / monthStats.received) * 100 : 0,
      },
      total: {
        tasksReceived: totalStats.received,
        tasksCompleted: totalStats.completed,
        completionRate: totalStats.received > 0 ? (totalStats.completed / totalStats.received) * 100 : 0,
        longestStreak,
      },
    };
  }

  private async getNextExerciseForUser(userId: string): Promise<Exercise | null> {
    const lastTask = await prisma.task.findFirst({
      where: { userId },
      include: { exercise: true },
      orderBy: { createdAt: 'desc' },
    });

    const activeExercises = await prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    if (activeExercises.length === 0) {
      return null;
    }

    if (!lastTask) {
      return activeExercises[0];
    }

    const currentIndex = activeExercises.findIndex((ex: any) => ex.id === lastTask.exercise.id);
    const nextIndex = (currentIndex + 1) % activeExercises.length;
    
    return activeExercises[nextIndex];
  }

  private formatTaskResponse(task: {
    id: string;
    text: string;
    textEn: string | null;
    date: Date;
    status: string;
    completedAt: Date | null;
    exercise: {
      id: string;
      title: string;
      titleEn: string | null;
      category: string;
      categoryEn: string | null;
    };
  }): TaskResponse {
    return {
      id: task.id,
      text: task.text,
      textEn: task.textEn || undefined,
      date: task.date,
      status: task.status as TaskStatus,
      completedAt: task.completedAt || undefined,
      exercise: {
        id: task.exercise.id,
        title: task.exercise.title,
        titleEn: task.exercise.titleEn || undefined,
        category: task.exercise.category,
        categoryEn: task.exercise.categoryEn || undefined,
      },
    };
  }

  private async getStatsForPeriod(userId: string, startDate: Date, endDate: Date): Promise<{
    received: number;
    completed: number;
  }> {
    const [received, completed] = await Promise.all([
      prisma.task.count({
        where: {
          userId,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: TaskStatus.COMPLETED,
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),
    ]);

    return { received, completed };
  }

  private async updateUserProgress(userId: string, date: Date): Promise<void> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const stats = await this.getStatsForPeriod(userId, dayStart, new Date(dayStart.getTime() + 24 * 60 * 60 * 1000));
    const streak = await this.calculateStreak(userId);

    await prisma.userProgress.upsert({
      where: {
        userId_date: {
          userId,
          date: dayStart,
        },
      },
      update: {
        tasksReceived: stats.received,
        tasksCompleted: stats.completed,
        streak,
      },
      create: {
        userId,
        date: dayStart,
        tasksReceived: stats.received,
        tasksCompleted: stats.completed,
        streak,
      },
    });
  }

  private async calculateStreak(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const completedTask = await prisma.task.findFirst({
        where: {
          userId,
          status: TaskStatus.COMPLETED,
          date: {
            gte: currentDate,
            lt: dayEnd,
          },
        },
      });

      if (completedTask) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private async calculateLongestStreak(userId: string): Promise<number> {
    const completedTasks = await prisma.task.findMany({
      where: {
        userId,
        status: TaskStatus.COMPLETED,
      },
      select: { date: true },
      orderBy: { date: 'asc' },
    });

    if (completedTasks.length === 0) {
      return 0;
    }

    let maxStreak = 1;
    let currentStreak = 1;
    let previousDate = completedTasks[0].date;

    for (let i = 1; i < completedTasks.length; i++) {
      const currentDate = completedTasks[i].date;
      const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (daysDiff > 1) {
        currentStreak = 1;
      }

      previousDate = currentDate;
    }

    return maxStreak;
  }

  async getTaskById(taskId: string, userId: string): Promise<TaskResponse | null> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    return this.formatTaskResponse(task);
  }

  async skipTask(taskId: string, userId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(ERROR_MESSAGES.TASK_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (task.status !== TaskStatus.PENDING) {
      return this.formatTaskResponse(task);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.SKIPPED,
      },
      include: {
        exercise: {
          select: {
            id: true,
            title: true,
            titleEn: true,
            category: true,
            categoryEn: true,
          },
        },
      },
    });

    return this.formatTaskResponse(updatedTask);
  }
}

export const taskService = new TaskService();