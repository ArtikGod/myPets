import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../index';

const prisma = new PrismaClient();

describe('Progress API', () => {
  let authToken: string;
  let userId: string;
  let exerciseId: string;

  beforeAll(async () => {
    // Очистка базы данных
    await prisma.userProgress.deleteMany();
    await prisma.task.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.user.deleteMany();

    // Создание тестового пользователя
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'progress@example.com',
        password: hashedPassword,
        role: 'USER',
        locale: 'ru',
        timezone: 'Europe/Moscow',
        isActive: true,
      },
    });
    userId = user.id;

    // Создание JWT токена
    authToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY || 'test-jwt-secret-key-for-psychology-bot',
      { expiresIn: '1h' }
    );

    // Создание тестового упражнения
    const exercise = await prisma.exercise.create({
      data: {
        title: 'Тестовое упражнение для прогресса',
        titleEn: 'Test Exercise for Progress',
        description: 'Описание тестового упражнения',
        descriptionEn: 'Test exercise description',
        category: 'meditation',
        categoryEn: 'meditation',
        order: 1,
      },
    });
    exerciseId = exercise.id;

    // Создание тестовых задач и прогресса
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Задачи на сегодня
    await prisma.task.create({
      data: {
        userId,
        exerciseId,
        text: 'Сегодняшняя задача 1',
        textEn: 'Today task 1',
        date: today,
        status: 'COMPLETED',
        completedAt: today,
      },
    });

    await prisma.task.create({
      data: {
        userId,
        exerciseId,
        text: 'Сегодняшняя задача 2',
        textEn: 'Today task 2',
        date: today,
        status: 'PENDING',
      },
    });

    // Задачи на вчера
    await prisma.task.create({
      data: {
        userId,
        exerciseId,
        text: 'Вчерашняя задача',
        textEn: 'Yesterday task',
        date: yesterday,
        status: 'COMPLETED',
        completedAt: yesterday,
      },
    });

    // Задачи неделю назад
    await prisma.task.create({
      data: {
        userId,
        exerciseId,
        text: 'Задача неделю назад',
        textEn: 'Week ago task',
        date: weekAgo,
        status: 'COMPLETED',
        completedAt: weekAgo,
      },
    });

    // Создание записей прогресса
    await prisma.userProgress.create({
      data: {
        userId,
        date: today,
        tasksReceived: 2,
        tasksCompleted: 1,
        streak: 3,
      },
    });

    await prisma.userProgress.create({
      data: {
        userId,
        date: yesterday,
        tasksReceived: 1,
        tasksCompleted: 1,
        streak: 2,
      },
    });

    await prisma.userProgress.create({
      data: {
        userId,
        date: weekAgo,
        tasksReceived: 1,
        tasksCompleted: 1,
        streak: 1,
      },
    });
  });

  afterAll(async () => {
    // Очистка базы данных
    await prisma.userProgress.deleteMany();
    await prisma.task.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/progress', () => {
    it('should get user progress successfully', async () => {
      const response = await request(app)
        .get('/api/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.today).toBeDefined();
      expect(response.body.data.week).toBeDefined();
      expect(response.body.data.month).toBeDefined();
      expect(response.body.data.total).toBeDefined();
    });

    it('should include correct today statistics', async () => {
      const response = await request(app)
        .get('/api/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.today.tasksReceived).toBe(2);
      expect(response.body.data.today.tasksCompleted).toBe(1);
      expect(response.body.data.today.completionRate).toBe(50);
    });

    it('should include streak information', async () => {
      const response = await request(app)
        .get('/api/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.currentStreak).toBeDefined();
      expect(typeof response.body.data.currentStreak).toBe('number');
    });

    it('should include weekly and monthly statistics', async () => {
      const response = await request(app)
        .get('/api/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.week.tasksReceived).toBeGreaterThan(0);
      expect(response.body.data.week.tasksCompleted).toBeGreaterThan(0);
      expect(response.body.data.month.tasksReceived).toBeGreaterThan(0);
      expect(response.body.data.month.tasksCompleted).toBeGreaterThan(0);
    });

    it('should not get progress without authentication', async () => {
      const response = await request(app)
        .get('/api/progress')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/progress/chart', () => {
    it('should get chart data for authenticated user', async () => {
      const response = await request(app)
        .get('/api/progress/chart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support period parameter', async () => {
      const response = await request(app)
        .get('/api/progress/chart?period=week')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return data with correct structure', async () => {
      const response = await request(app)
        .get('/api/progress/chart?period=month')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (response.body.data.length > 0) {
        const dataPoint = response.body.data[0];
        expect(dataPoint.date).toBeDefined();
        expect(dataPoint.tasksReceived).toBeDefined();
        expect(dataPoint.tasksCompleted).toBeDefined();
        expect(dataPoint.completionRate).toBeDefined();
      }
    });

    it('should not get chart data without authentication', async () => {
      const response = await request(app)
        .get('/api/progress/chart')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/progress/stats', () => {
    it('should get detailed statistics', async () => {
      const response = await request(app)
        .get('/api/progress/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalTasks).toBeDefined();
      expect(response.body.data.completedTasks).toBeDefined();
      expect(response.body.data.averageCompletionRate).toBeDefined();
      expect(response.body.data.longestStreak).toBeDefined();
    });

    it('should include category breakdown', async () => {
      const response = await request(app)
        .get('/api/progress/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.categoryStats).toBeDefined();
      expect(Array.isArray(response.body.data.categoryStats)).toBe(true);
    });

    it('should not get stats without authentication', async () => {
      const response = await request(app)
        .get('/api/progress/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});