import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Загружаем переменные окружения для тестов
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Устанавливаем NODE_ENV для тестов
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/psychology_bot_test',
    },
  },
  log: ['error'], // Только ошибки в тестах
});

// Глобальные настройки для Jest
beforeAll(async () => {
  // Подключение к тестовой базе данных
  await prisma.$connect();
  
  // Очистка базы данных перед тестами
  await prisma.userProgress.deleteMany();
  await prisma.task.deleteMany();
  await prisma.customTask.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Очистка и отключение от базы данных
  await prisma.userProgress.deleteMany();
  await prisma.task.deleteMany();
  await prisma.customTask.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

export { prisma };