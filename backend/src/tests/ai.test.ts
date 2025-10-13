import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../index';

jest.mock('../services/aiService', () => ({
  aiService: {
    isConfigured: jest.fn(() => true),
    generateExercise: jest.fn(async (request: any) => {
      if (!request.category) {
        throw new Error('Missing required fields');
      }
      if (!['meditation', 'breathing', 'gratitude', 'mindfulness', 'reflection', 'relaxation'].includes(request.category)) {
        throw new Error('Invalid category');
      }
      if (request.language && !['ru', 'en'].includes(request.language)) {
        throw new Error('Invalid language');
      }
      return {
        title: 'Test Exercise',
        titleEn: request.language === 'en' ? 'Test Exercise' : undefined,
        description: 'Test exercise description',
        descriptionEn: request.language === 'en' ? 'Test exercise description' : undefined,
        category: request.category,
        categoryEn: request.language === 'en' ? request.category : undefined,
        estimatedTime: 10,
      };
    }),
    generateMultipleExercises: jest.fn(async (count: number, request: any) => {
      const exercises = [];
      for (let i = 0; i < count; i++) {
        exercises.push({
          title: `Test Exercise ${i + 1}`,
          description: `Test exercise description ${i + 1}`,
          category: request.category,
          estimatedTime: 10,
        });
      }
      return exercises;
    }),
  }
}));

// Получаем замоканный сервис для использования в тестах
const { aiService: mockAiService } = require('../services/aiService');

const prisma = new PrismaClient();

describe('AI API', () => {
  let authToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    // Очистка базы данных
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
  });

  afterAll(async () => {
    // Очистка базы данных
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/ai/generate-exercise', () => {
    it('should generate exercise for admin user', async () => {
      const requestData = {
        category: 'meditation',
        language: 'ru',
        prompt: 'Создай упражнение для медитации на 5 минут',
      };

      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBeDefined();
      expect(response.body.data.description).toBeDefined();
      expect(response.body.data.category).toBe(requestData.category);
    });

    it('should generate exercise in English', async () => {
      const requestData = {
        category: 'breathing',
        language: 'en',
        prompt: 'Create a breathing exercise for stress relief',
      };

      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.titleEn).toBeDefined();
      expect(response.body.data.descriptionEn).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate category', async () => {
      const requestData = {
        category: 'invalid-category',
        language: 'ru',
        prompt: 'Тест',
      };

      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate language', async () => {
      const requestData = {
        category: 'meditation',
        language: 'invalid-lang',
        prompt: 'Тест',
      };

      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not allow non-admin users', async () => {
      const requestData = {
        category: 'meditation',
        language: 'ru',
        prompt: 'Создай упражнение',
      };

      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should not work without authentication', async () => {
      const requestData = {
        category: 'meditation',
        language: 'ru',
        prompt: 'Создай упражнение',
      };

      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .send(requestData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should handle AI service errors gracefully', async () => {
      // Мокаем ошибку AI сервиса, отправляя невалидный промпт
      const requestData = {
        category: 'meditation',
        language: 'ru',
        prompt: '', // Пустой промпт может вызвать ошибку
      };

      const response = await request(app)
        .post('/api/ai/generate-exercise')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai/generate-custom-task', () => {
    it('should generate custom task for authenticated user', async () => {
      const requestData = {
        category: 'gratitude',
        language: 'ru',
        prompt: 'Создай упражнение благодарности',
      };

      const response = await request(app)
        .post('/api/ai/generate-custom-task')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.title).toBeDefined();
      expect(response.body.data.description).toBeDefined();
    });

    it('should generate custom task in English', async () => {
      const requestData = {
        category: 'mindfulness',
        language: 'en',
        prompt: 'Create a mindfulness exercise',
      };

      const response = await request(app)
        .post('/api/ai/generate-custom-task')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.titleEn).toBeDefined();
      expect(response.body.data.descriptionEn).toBeDefined();
    });

    it('should validate required fields for custom task', async () => {
      const response = await request(app)
        .post('/api/ai/generate-custom-task')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not work without authentication', async () => {
      const requestData = {
        category: 'meditation',
        language: 'ru',
        prompt: 'Создай упражнение',
      };

      const response = await request(app)
        .post('/api/ai/generate-custom-task')
        .send(requestData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/categories', () => {
    it('should get available categories', async () => {
      const response = await request(app)
        .get('/api/ai/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data).toBe('object');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should include category details', async () => {
      const response = await request(app)
        .get('/api/ai/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const category = response.body.data[0];
      expect(category.key).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.nameEn).toBeDefined();
      expect(category.name).toBeDefined();
      expect(category.nameEn).toBeDefined();
    });

    it('should not work without authentication', async () => {
      const response = await request(app)
        .get('/api/ai/categories')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/prompts', () => {
    it('should get example prompts for admin', async () => {
      const response = await request(app)
        .get('/api/ai/prompts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data).toBe('object');
    });

    it('should filter prompts by category', async () => {
      const response = await request(app)
        .get('/api/ai/prompts?category=meditation')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(typeof response.body.data).toBe('object');
      expect(response.body.data.meditation).toBeDefined();
    });

    it('should not allow non-admin users', async () => {
      const response = await request(app)
        .get('/api/ai/prompts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should not work without authentication', async () => {
      const response = await request(app)
        .get('/api/ai/prompts')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});