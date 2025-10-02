import { Pool } from '../node_modules/@types/pg';
import { DATABASE_CONFIG, SQL_QUERIES, SEED_MESSAGES } from '../src/constants';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: DATABASE_CONFIG.HOST,
  port: DATABASE_CONFIG.PORT,
  database: DATABASE_CONFIG.NAME,
  user: DATABASE_CONFIG.USER,
  password: DATABASE_CONFIG.PASSWORD,
  min: DATABASE_CONFIG.POOL_MIN,
  max: DATABASE_CONFIG.POOL_MAX,
});

const seedIdeas = [
  {
    title: 'Добавить темную тему',
    description: 'Реализовать возможность переключения между светлой и темной темой интерфейса для комфортной работы в любое время суток'
  },
  {
    title: 'Мобильное приложение',
    description: 'Создать нативное мобильное приложение для iOS и Android с полным функционалом платформы'
  },
  {
    title: 'Система достижений',
    description: 'Внедрить геймификацию с наградами, бейджами и уровнями для мотивации учеников'
  },
  {
    title: 'Родительский контроль',
    description: 'Добавить панель для родителей с отчетами о прогрессе ребенка и настройками времени занятий'
  },
  {
    title: 'Офлайн режим',
    description: 'Возможность скачивать задания для решения без подключения к интернету'
  },
  {
    title: 'Персонализированные задания',
    description: 'ИИ-алгоритм для создания индивидуальных заданий на основе сильных и слабых сторон ученика'
  },
  {
    title: 'Групповые соревнования',
    description: 'Командные турниры и соревнования между классами или группами друзей'
  },
  {
    title: 'Интеграция с школами',
    description: 'API для интеграции с школьными системами и возможность создания заданий учителями'
  },
  {
    title: 'Голосовые подсказки',
    description: 'Озвучивание заданий и подсказок для детей с особенностями восприятия текста'
  },
  {
    title: 'Расширенная аналитика',
    description: 'Детальные отчеты о прогрессе с рекомендациями по улучшению навыков логического мышления'
  }
];

async function seedDatabase() {
  try {
    console.log(SEED_MESSAGES.STARTING);
    
    await pool.query(SQL_QUERIES.DELETE_VOTES);
    await pool.query(SQL_QUERIES.DELETE_IDEAS);
    await pool.query(SQL_QUERIES.RESET_SEQUENCE);
    
    for (const idea of seedIdeas) {
      await pool.query(
        SQL_QUERIES.INSERT_IDEA,
        [idea.title, idea.description]
      );
    }
    
    console.log(SEED_MESSAGES.IDEAS_ADDED(seedIdeas.length));
    console.log(SEED_MESSAGES.SUCCESS);
    
  } catch (error) {
    console.error(SEED_MESSAGES.ERROR, error);
  } finally {
    await pool.end();
  }
}

seedDatabase().catch(console.error);

export { seedDatabase };