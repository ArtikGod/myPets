import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { setupCommands } from './handlers/commands';
import { setupMiddleware, BotContext } from './middleware';
import { apiService } from './services/apiService';
import { startScheduler } from './services/schedulerService';

dotenv.config();

const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'BACKEND_API_URL'];

const validateEnvVars = (): void => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Отсутствуют обязательные переменные окружения:', missingVars.join(', '));
    process.exit(1);
  }
};

validateEnvVars();

const bot = new Telegraf<BotContext>(process.env.TELEGRAM_BOT_TOKEN!);

setupMiddleware(bot);
setupCommands(bot);

const startBot = async (): Promise<void> => {
  try {
    console.log('🤖 Запуск Telegram бота...');
    
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Начать работу с ботом' },
      { command: 'help', description: 'Показать справку' },
      { command: 'today', description: 'Получить задание на сегодня' },
      { command: 'done', description: 'Отметить задание как выполненное' },
      { command: 'progress', description: 'Посмотреть прогресс' },
      { command: 'settings', description: 'Настройки' },
      { command: 'custom', description: 'Пользовательские задания' },
    ]);

    await bot.launch();
    console.log('✅ Telegram бот запущен успешно');

    if (process.env.SCHEDULER_ENABLED !== 'false') {
      startScheduler();
      console.log('⏰ Планировщик задач запущен');
    }

    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Получен сигнал ${signal}. Завершение работы бота...`);
      bot.stop(signal);
      console.log('✅ Telegram бот завершен корректно');
      process.exit(0);
    };

    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startBot();
}

export default bot;