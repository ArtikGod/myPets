import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../index';

const prisma = new PrismaClient();

describe('Tasks API', () => {
  let authToken: string;
  let userId: string;
  let exerciseId: string;

  beforeAll(async () => {
    // Очистка базы данных
    await prisma.task.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.user.deleteMany();

    // Создание тестового пользователя
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
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
        title: 'Тестовое упражнение',
        titleEn: 'Test Exercise',
        description: 'Описание тестового упражнения',
        descriptionEn: 'Test exercise description',
        category: 'meditation',
        categoryEn: 'meditation',
        order: 1,
      },
    });
    exerciseId = exercise.id;
  });

  afterAll(async () => {
    // Очистка базы данных
    await prisma.task.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/tasks/today', () => {
    it('should get today task for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks/today')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should not get task without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks/today')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/history', () => {
    beforeAll(async () => {
      // Создание тестовых задач
      await prisma.task.create({
        data: {
          userId,
          exerciseId,
          text: 'Тестовая задача 1',
          textEn: 'Test task 1',
          date: new Date(),
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      await prisma.task.create({
        data: {
          userId,
          exerciseId,
          text: 'Тестовая задача 2',
          textEn: 'Test task 2',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // вчера
          status: 'PENDING',
        },
      });
    });

    it('should get task history for authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
      expect(response.body.data.tasks.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/tasks/history?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBeLessThanOrEqual(1);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should not get history without authentication', async () => {
      const response = await request(app)
        .get('/api/tasks/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tasks/:id/complete', () => {
    let taskId: string;

    beforeAll(async () => {
      const task = await prisma.task.create({
        data: {
          userId,
          exerciseId,
          text: 'Задача для завершения',
          textEn: 'Task to complete',
          date: new Date(),
          status: 'PENDING',
        },
      });
      taskId = task.id;
    });

    it('should complete task successfully', async () => {
      const response = await request(app)
        .post(`/api/tasks/${taskId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.completedAt).toBeDefined();
    });

    it('should not complete non-existent task', async () => {
      const response = await request(app)
        .post('/api/tasks/non-existent-id/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not complete task without authentication', async () => {
      const response = await request(app)
        .post(`/api/tasks/${taskId}/complete`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/tasks/:id/skip', () => {
    let taskId: string;

    beforeAll(async () => {
      const task = await prisma.task.create({
        data: {
          userId,
          exerciseId,
          text: 'Задача для пропуска',
          textEn: 'Task to skip',
          date: new Date(),
          status: 'PENDING',
        },
      });
      taskId = task.id;
    });

    it('should skip task successfully', async () => {
      const response = await request(app)
        .post(`/api/tasks/${taskId}/skip`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SKIPPED');
    });

    it('should not skip non-existent task', async () => {
      const response = await request(app)
        .post('/api/tasks/non-existent-id/skip')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not skip task without authentication', async () => {
      const response = await request(app)
        .post(`/api/tasks/${taskId}/skip`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskId: string;

    beforeAll(async () => {
      const task = await prisma.task.create({
        data: {
          userId,
          exerciseId,
          text: 'Задача для получения',
          textEn: 'Task to get',
          date: new Date(),
          status: 'PENDING',
        },
      });
      taskId = task.id;
    });

    it('should get task by id successfully', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
      expect(response.body.data.text).toBeDefined();
    });

    it('should not get non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not get task without authentication', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});