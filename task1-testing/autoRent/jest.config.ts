import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  moduleNameMapper: {
    '^(.*)\\.(css|less|scss)$': '<rootDir>/__tests__/mocks/styleMock.ts',
  },
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/globals.d.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/server.ts',
    '!src/telegrambot.ts',
    '!src/connectdb.ts',
  ],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/'],
  // Увеличиваем timeout для performance тестов
  testTimeout: 120000, // 2 минуты
  // Настройки для корректного завершения тестов
  forceExit: true,
  detectOpenHandles: true,
};

export default config;


