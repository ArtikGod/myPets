import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../index';

const prisma = new PrismaClient();

describe('Admin API', () => {
  let authToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let exerciseId: string;

  beforeAll(async () => {
    // Очистка базы данных
    await prisma.task.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.user.deleteMany();

    // Создание обычного пользователя
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'USER',
        locale: 'ru',
        timezone: 'Europe/Moscow',
        isActive: true,
      },
    });
    userId = user.id;

    // Создание админа
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        locale: 'ru',
        timezone: 'Europe/Moscow',
        isActive: true,
      },
    });
    adminId = admin.id;

    // Создание JWT токенов
    authToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY || 'test-jwt-secret-key-for-psychology-bot',
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
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

    // Создание тестовых задач для статистики
    await prisma.task.create({
      data: {
        userId,
        exerciseId,
        text: 'Тестовая задача',
        textEn: 'Test task',
        date: new Date(),
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    // Очистка базы данных
    await prisma.task.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/admin/users', () => {
    it('should get users list for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeLessThanOrEqual(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/admin/users?search=Test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.users.forEach((user: any) => {
        expect(user.role).toBe('ADMIN');
      });
    });

    it('should not allow non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should not work without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should get user details for admin', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.password).toBeUndefined();
    });

    it('should not get non-existent user', async () => {
      const response = await request(app)
        .get('/api/admin/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow non-admin users', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user for admin', async () => {
      const updateData = {
        name: 'Updated User Name',
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.isActive).toBe(updateData.isActive);
    });

    it('should validate update data', async () => {
      const updateData = {
        email: 'invalid-email',
      };

      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not update non-existent user', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put('/api/admin/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow non-admin users', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should get system statistics for admin', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.exercises).toBeDefined();
      expect(response.body.data.tasks).toBeDefined();
      expect(response.body.data.completionRate).toBeDefined();
    });

    it('should include user statistics', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.users.total).toBeGreaterThan(0);
      expect(response.body.data.users.active).toBeDefined();
      expect(response.body.data.users.newThisMonth).toBeDefined();
    });

    it('should include task statistics', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.tasks.total).toBeGreaterThan(0);
      expect(response.body.data.tasks.completed).toBeDefined();
      expect(response.body.data.tasks.pending).toBeDefined();
    });

    it('should support date range filtering', async () => {
      const response = await request(app)
        .get('/api/admin/stats?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should not allow non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not work without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/exercises', () => {
    it('should get exercises list for admin', async () => {
      const response = await request(app)
        .get('/api/admin/exercises')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.exercises)).toBe(true);
      expect(response.body.data.exercises.length).toBeGreaterThan(0);
    });

    it('should support search and filtering', async () => {
      const response = await request(app)
        .get('/api/admin/exercises?category=meditation')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.exercises.forEach((exercise: any) => {
        expect(exercise.category).toBe('meditation');
      });
    });

    it('should not allow non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/exercises', () => {
    it('should create exercise for admin', async () => {
      const exerciseData = {
        title: 'Новое упражнение',
        titleEn: 'New Exercise',
        description: 'Описание нового упражнения',
        descriptionEn: 'New exercise description',
        category: 'breathing',
        categoryEn: 'breathing',
        order: 2,
      };

      const response = await request(app)
        .post('/api/admin/exercises')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(exerciseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(exerciseData.title);
      expect(response.body.data.category).toBe(exerciseData.category);
    });

    it('should validate exercise data', async () => {
      const response = await request(app)
        .post('/api/admin/exercises')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not allow non-admin users', async () => {
      const exerciseData = {
        title: 'Упражнение от пользователя',
        description: 'Описание',
        category: 'meditation',
        order: 1,
      };

      const response = await request(app)
        .post('/api/admin/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exerciseData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/exercises/:id', () => {
    it('should update exercise for admin', async () => {
      const updateData = {
        title: 'Обновленное упражнение',
        titleEn: 'Updated Exercise',
        isActive: false,
      };

      const response = await request(app)
        .put(`/api/admin/exercises/${exerciseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.isActive).toBe(updateData.isActive);
    });

    it('should not update non-existent exercise', async () => {
      const updateData = {
        title: 'Обновление',
      };

      const response = await request(app)
        .put('/api/admin/exercises/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow non-admin users', async () => {
      const updateData = {
        title: 'Обновление от пользователя',
      };

      const response = await request(app)
        .put(`/api/admin/exercises/${exerciseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/exercises/:id', () => {
    let exerciseToDeleteId: string;

    beforeAll(async () => {
      const exercise = await prisma.exercise.create({
        data: {
          title: 'Упражнение для удаления',
          titleEn: 'Exercise to delete',
          description: 'Описание',
          descriptionEn: 'Description',
          category: 'test',
          categoryEn: 'test',
          order: 999,
        },
      });
      exerciseToDeleteId = exercise.id;
    });

    it('should delete exercise for admin', async () => {
      const response = await request(app)
        .delete(`/api/admin/exercises/${exerciseToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Проверяем, что упражнение удалено
      const deletedExercise = await prisma.exercise.findUnique({
        where: { id: exerciseToDeleteId },
      });
      expect(deletedExercise).toBeNull();
    });

    it('should not delete non-existent exercise', async () => {
      const response = await request(app)
        .delete('/api/admin/exercises/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should not allow non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/admin/exercises/${exerciseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});