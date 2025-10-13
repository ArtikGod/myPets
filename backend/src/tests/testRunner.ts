import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    console.log('🔧 Настройка тестовой базы данных...');
    
    // Генерация Prisma клиента
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Применение миграций
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    
    console.log('✅ Тестовая база данных настроена');
  } catch (error) {
    console.error('❌ Ошибка настройки тестовой базы данных:', error);
    process.exit(1);
  }
}

async function runTests() {
  try {
    console.log('🧪 Запуск тестов...');
    
    // Запуск Jest тестов
    execSync('npx jest --config jest.config.js', { stdio: 'inherit' });
    
    console.log('✅ Все тесты выполнены');
  } catch (error) {
    console.error('❌ Ошибка выполнения тестов:', error);
    process.exit(1);
  }
}

async function cleanup() {
  try {
    console.log('🧹 Очистка после тестов...');
    await prisma.$disconnect();
    console.log('✅ Очистка завершена');
  } catch (error) {
    console.error('❌ Ошибка очистки:', error);
  }
}

async function main() {
  try {
    await setupTestDatabase();
    await runTests();
  } finally {
    await cleanup();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}

export { setupTestDatabase, runTests, cleanup };