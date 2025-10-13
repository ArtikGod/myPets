import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../index';

const prisma = new PrismaClient();

describe('Custom Tasks API', () => {
  let authToken: string;
  let userId: string;
  let customTaskId: string;

  beforeAll(async () => {
    // Очистка базы данных
    await prisma.customTask.deleteMany();
    await prisma.user.deleteMany();

    // Создание тестового пользователя
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'customtasks@example.com',
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
  });

  afterAll(async () => {
    // Очистка базы данных
    await prisma.customTask.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/custom-tasks', () => {
    it('should create custom task successfully', async () => {
      const taskData = {
        title: 'Моя пользовательская задача',
        titleEn: 'My custom task',
        description: 'Описание пользовательской задачи',
        descriptionEn: 'Custom task description',
      };

      const response = await request(app)
        .post('/api/custom-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.titleEn).toBe(taskData.titleEn);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.descriptionEn).toBe(taskData.descriptionEn);
      expect(response.body.data.userId).toBe(userId);

      customTaskId = response.body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/custom-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate title length', async () => {
      const taskData = {
        title: 'A'.repeat(256), // Слишком длинный заголовок
        description: 'Описание',
      };

      const response = await request(app)
        .post('/api/custom-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not create task without authentication', async () => {
      const taskData = {
        title: 'Задача без авторизации',
        description: 'Описание',
      };

      const response = await request(app)
        .post('/api/custom-tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/custom-tasks', () => {
    beforeAll(async () => {
      // Создание дополнительных тестовых задач
      await prisma.customTask.create({
        data: {
          userId,
          title: 'Задача 2',
          titleEn: 'Task 2',
          description: 'Описание задачи 2',
          descriptionEn: 'Task 2 description',
        },
      });

      await prisma.customTask.create({
        data: {
          userId,
          title: 'Неактивная задача',
          titleEn: 'Inactive task',
          description: 'Описание неактивной задачи',
          descriptionEn: 'Inactive task description',
          isActive: false,
        },
      });
    });

    it('should get user custom tasks', async () => {
      const response = await request(app)
        .get('/api/custom-tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
      expect(response.body.data.tasks.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/custom-tasks?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks.length).toBeLessThanOrEqual(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    it('should filter by active status', async () => {
      const response = await request(app)
        .get('/api/custom-tasks?isActive=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.tasks.forEach((task: any) => {
        expect(task.isActive).toBe(true);
      });
    });

    it('should not get tasks without authentication', async () => {
      const response = await request(app)
        .get('/api/custom-tasks')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/custom-tasks/:id', () => {
    it('should get custom task by id', async () => {
      const response = await request(app)
        .get(`/api/custom-tasks/${customTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(customTaskId);
      expect(response.body.data.title).toBeDefined();
    });

    it('should not get non-existent task', async () => {
      const response = await request(app)
        .get('/api/custom-tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not get task without authentication', async () => {
      const response = await request(app)
        .get(`/api/custom-tasks/${customTaskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/custom-tasks/:id', () => {
    it('should update custom task successfully', async () => {
      const updateData = {
        title: 'Обновленная задача',
        titleEn: 'Updated task',
        description: 'Обновленное описание',
        descriptionEn: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/custom-tasks/${customTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.titleEn).toBe(updateData.titleEn);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.descriptionEn).toBe(updateData.descriptionEn);
    });

    it('should validate update data', async () => {
      const updateData = {
        title: '', // Пустой заголовок
      };

      const response = await request(app)
        .put(`/api/custom-tasks/${customTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not update non-existent task', async () => {
      const updateData = {
        title: 'Обновление несуществующей задачи',
        description: 'Описание',
      };

      const response = await request(app)
        .put('/api/custom-tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not update task without authentication', async () => {
      const updateData = {
        title: 'Обновление без авторизации',
        description: 'Описание',
      };

      const response = await request(app)
        .put(`/api/custom-tasks/${customTaskId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/custom-tasks/:id', () => {
    let taskToDeleteId: string;

    beforeAll(async () => {
      const task = await prisma.customTask.create({
        data: {
          userId,
          title: 'Задача для удаления',
          titleEn: 'Task to delete',
          description: 'Описание задачи для удаления',
          descriptionEn: 'Task to delete description',
        },
      });
      taskToDeleteId = task.id;
    });

    it('should delete custom task successfully', async () => {
      const response = await request(app)
        .delete(`/api/custom-tasks/${taskToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Проверяем, что задача действительно удалена
      const deletedTask = await prisma.customTask.findUnique({
        where: { id: taskToDeleteId },
      });
      expect(deletedTask).toBeNull();
    });

    it('should not delete non-existent task', async () => {
      const response = await request(app)
        .delete('/api/custom-tasks/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not delete task without authentication', async () => {
      const response = await request(app)
        .delete(`/api/custom-tasks/${customTaskId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/custom-tasks/:id/toggle', () => {
    it('should toggle task active status', async () => {
      const response = await request(app)
        .post(`/api/custom-tasks/${customTaskId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.isActive).toBe('boolean');
    });

    it('should not toggle non-existent task', async () => {
      const response = await request(app)
        .post('/api/custom-tasks/non-existent-id/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not toggle without authentication', async () => {
      const response = await request(app)
        .post(`/api/custom-tasks/${customTaskId}/toggle`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});