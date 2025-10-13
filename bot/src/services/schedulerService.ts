import cron from 'node-cron';
import { apiService } from './apiService';

interface ScheduledUser {
  telegramId: string;
  name: string;
  locale: string;
  timezone: string;
}

class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;

  startScheduler(): void {
    if (this.isRunning) {
      console.log('⏰ Планировщик уже запущен');
      return;
    }

    const cronPattern = process.env.DAILY_TASK_CRON || '0 9 * * *'; // 09:00 каждый день
    
    const job = cron.schedule(cronPattern, async () => {
      console.log('🔄 Запуск ежедневной отправки заданий...');
      await this.sendDailyTasks();
    }, {
      scheduled: true,
      timezone: process.env.TIMEZONE || 'Europe/Moscow',
    });

    this.jobs.set('daily_tasks', job);
    this.isRunning = true;
    
    console.log(`⏰ Планировщик запущен с паттерном: ${cronPattern}`);
    console.log(`🌍 Часовой пояс: ${process.env.TIMEZONE || 'Europe/Moscow'}`);
  }

  stopScheduler(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Остановлен планировщик: ${name}`);
    });
    
    this.jobs.clear();
    this.isRunning = false;
    console.log('⏹️ Все планировщики остановлены');
  }

  async sendDailyTasks(): Promise<void> {
    try {
      const users = await this.getActiveUsers();
      console.log(`👥 Найдено активных пользователей: ${users.length}`);

      if (users.length === 0) {
        console.log('ℹ️ Нет активных пользователей для отправки заданий');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await this.sendTaskToUser(user);
          successCount++;
          
          await this.delay(100);
        } catch (error) {
          console.error(`❌ Ошибка отправки задания пользователю ${user.telegramId}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Отправка завершена. Успешно: ${successCount}, Ошибок: ${errorCount}`);
    } catch (error) {
      console.error('❌ Критическая ошибка в планировщике:', error);
    }
  }

  private async getActiveUsers(): Promise<ScheduledUser[]> {
    try {
      const response = await apiService.getActiveUsers();
      
      if (!response.success || !response.data) {
        console.error('❌ Ошибка получения списка пользователей:', response.error);
        return [];
      }

      return response.data.users.map((user: any) => ({
        telegramId: user.telegramId,
        name: user.name,
        locale: user.locale || 'ru',
        timezone: user.timezone || 'Europe/Moscow',
      }));
    } catch (error) {
      console.error('❌ Ошибка получения активных пользователей:', error);
      return [];
    }
  }

  private async sendTaskToUser(user: ScheduledUser): Promise<void> {
    try {
      const taskResponse = await apiService.getTodayTask(user.telegramId);
      
      if (!taskResponse.success || !taskResponse.data) {
        console.log(`ℹ️ Нет задания для пользователя ${user.telegramId}`);
        return;
      }

      const task = taskResponse.data.task;
      
      if (task.status !== 'PENDING') {
        console.log(`ℹ️ Задание уже обработано для пользователя ${user.telegramId}`);
        return;
      }

      const title = user.locale === 'en' && task.exercise.titleEn 
        ? task.exercise.titleEn 
        : task.exercise.title;
      
      const description = user.locale === 'en' && task.textEn 
        ? task.textEn 
        : task.text;

      const message = user.locale === 'en' 
        ? `🌅 *Good morning, ${user.name}!*\n\n📋 *Today's task:*\n\n*${title}*\n\n${description}\n\n💡 After completion, use /done command`
        : `🌅 *Доброе утро, ${user.name}!*\n\n📋 *Задание на сегодня:*\n\n*${title}*\n\n${description}\n\n💡 После выполнения используйте команду /done`;

      await this.sendTelegramMessage(user.telegramId, message);
      
      console.log(`✅ Задание отправлено пользователю ${user.telegramId} (${user.name})`);
    } catch (error) {
      console.error(`❌ Ошибка отправки задания пользователю ${user.telegramId}:`, error);
      throw error;
    }
  }

  private async sendTelegramMessage(telegramId: string, message: string): Promise<void> {
    try {
      const bot = require('../index').default;
      
      if (!bot) {
        throw new Error('Бот не инициализирован');
      }

      await bot.telegram.sendMessage(telegramId, message, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error(`❌ Ошибка отправки Telegram сообщения пользователю ${telegramId}:`, error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testScheduler(): Promise<void> {
    console.log('🧪 Тестовый запуск планировщика...');
    await this.sendDailyTasks();
  }

  getStatus(): { isRunning: boolean; jobsCount: number } {
    return {
      isRunning: this.isRunning,
      jobsCount: this.jobs.size,
    };
  }
}

export const schedulerService = new SchedulerService();

export const startScheduler = (): void => {
  schedulerService.startScheduler();
};

export const stopScheduler = (): void => {
  schedulerService.stopScheduler();
};

export const testScheduler = async (): Promise<void> => {
  await schedulerService.testScheduler();
};