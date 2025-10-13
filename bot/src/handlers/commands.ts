import { Telegraf } from 'telegraf';
import { BotContext, requireAuth, formatMessage, getUserMessages, getUserKeyboards } from '../middleware';
import { apiService } from '../services/apiService';
import { 
  BOT_COMMANDS, 
  MESSAGES, 
  KEYBOARDS, 
  REGISTRATION_STATES, 
  EMAIL_REGEX,
  API_ERRORS 
} from '../constants';

export const setupCommands = (bot: Telegraf<BotContext>) => {
  bot.command(BOT_COMMANDS.START, async (ctx) => {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    if (ctx.user) {
      const messages = getUserMessages(ctx.locale);
      await ctx.reply(messages.REGISTRATION_SUCCESS);
      return;
    }

    const messages = getUserMessages(ctx.locale);
    await ctx.reply(messages.WELCOME);
    await ctx.reply(messages.ASK_NAME);
    
    ctx.session.registrationState = REGISTRATION_STATES.WAITING_NAME;
    ctx.session.registrationData = {};
  });

  bot.command(BOT_COMMANDS.HELP, async (ctx) => {
    const messages = getUserMessages(ctx.locale);
    await ctx.reply(messages.HELP, { parse_mode: 'Markdown' });
  });

  bot.command(BOT_COMMANDS.TODAY, requireAuth(), async (ctx) => {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId || !ctx.user) return;

    const messages = getUserMessages(ctx.locale);
    
    try {
      const response = await apiService.getTodayTask(telegramId);
      
      if (!response.success || !response.data) {
        await ctx.reply(messages.NO_TASK_TODAY);
        return;
      }

      const task = response.data.task;
      const title = ctx.locale === 'en' && task.exercise.titleEn 
        ? task.exercise.titleEn 
        : task.exercise.title;
      
      const description = ctx.locale === 'en' && task.textEn 
        ? task.textEn 
        : task.text;

      const message = formatMessage(messages.TODAY_TASK, {
        title,
        description,
      });

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Ошибка получения задания:', error);
      await ctx.reply(messages.ERROR_OCCURRED);
    }
  });

  bot.command(BOT_COMMANDS.DONE, requireAuth(), async (ctx) => {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId || !ctx.user) return;

    const messages = getUserMessages(ctx.locale);
    
    try {
      const todayResponse = await apiService.getTodayTask(telegramId);
      
      if (!todayResponse.success || !todayResponse.data) {
        await ctx.reply(messages.NO_TASK_TODAY);
        return;
      }

      const taskId = todayResponse.data.task.id;
      
      if (todayResponse.data.task.status === 'COMPLETED') {
        await ctx.reply(messages.TASK_ALREADY_COMPLETED);
        return;
      }

      const response = await apiService.completeTask(telegramId, taskId);
      
      if (response.success) {
        await ctx.reply(messages.TASK_COMPLETED);
      } else {
        if (response.error === API_ERRORS.TASK_NOT_FOUND) {
          await ctx.reply(messages.TASK_NOT_FOUND);
        } else {
          await ctx.reply(messages.ERROR_OCCURRED);
        }
      }
    } catch (error) {
      console.error('Ошибка выполнения задания:', error);
      await ctx.reply(messages.ERROR_OCCURRED);
    }
  });

  bot.command(BOT_COMMANDS.PROGRESS, requireAuth(), async (ctx) => {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId || !ctx.user) return;

    const messages = getUserMessages(ctx.locale);
    
    try {
      const response = await apiService.getUserProgress(telegramId);
      
      if (!response.success || !response.data) {
        await ctx.reply(messages.ERROR_OCCURRED);
        return;
      }

      const progress = response.data.progress;
      
      let message = messages.PROGRESS_TITLE;
      
      message += formatMessage(messages.PROGRESS_TODAY, {
        received: progress.today.tasksReceived,
        completed: progress.today.tasksCompleted,
        rate: Math.round(progress.today.completionRate),
      });
      
      message += formatMessage(messages.PROGRESS_WEEK, {
        received: progress.week.tasksReceived,
        completed: progress.week.tasksCompleted,
        rate: Math.round(progress.week.completionRate),
        streak: progress.week.streak,
      });
      
      message += formatMessage(messages.PROGRESS_MONTH, {
        received: progress.month.tasksReceived,
        completed: progress.month.tasksCompleted,
        rate: Math.round(progress.month.completionRate),
      });
      
      message += formatMessage(messages.PROGRESS_TOTAL, {
        received: progress.total.tasksReceived,
        completed: progress.total.tasksCompleted,
        rate: Math.round(progress.total.completionRate),
        streak: progress.total.longestStreak,
      });

      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Ошибка получения прогресса:', error);
      await ctx.reply(messages.ERROR_OCCURRED);
    }
  });

  bot.command(BOT_COMMANDS.SETTINGS, requireAuth(), async (ctx) => {
    const messages = getUserMessages(ctx.locale);
    const keyboards = getUserKeyboards(ctx.locale);
    
    await ctx.reply(messages.SETTINGS_MENU, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: keyboards.SETTINGS,
      },
    });
  });

  bot.command(BOT_COMMANDS.CUSTOM, requireAuth(), async (ctx) => {
    const messages = getUserMessages(ctx.locale);
    await ctx.reply(messages.CUSTOM_TASKS_INFO, { parse_mode: 'Markdown' });
  });

  bot.on('text', async (ctx) => {
    if (!ctx.session.registrationState) return;

    const text = ctx.message.text;
    const messages = getUserMessages(ctx.locale);

    if (ctx.session.registrationState === REGISTRATION_STATES.WAITING_NAME) {
      if (text.length < 2 || text.length > 50) {
        await ctx.reply('❌ Имя должно содержать от 2 до 50 символов. Попробуйте еще раз.');
        return;
      }

      ctx.session.registrationData!.name = text;
      ctx.session.registrationState = REGISTRATION_STATES.WAITING_EMAIL;
      await ctx.reply(messages.ASK_EMAIL);
      
    } else if (ctx.session.registrationState === REGISTRATION_STATES.WAITING_EMAIL) {
      if (!EMAIL_REGEX.test(text)) {
        await ctx.reply(messages.INVALID_EMAIL);
        return;
      }

      const telegramId = ctx.from?.id.toString();
      if (!telegramId) return;

      try {
        const response = await apiService.registerTelegramUser(
          telegramId,
          ctx.session.registrationData!.name!,
          text,
          ctx.locale
        );

        if (response.success) {
          ctx.user = response.data!.user;
          await ctx.reply(messages.REGISTRATION_SUCCESS);
        } else {
          await ctx.reply(messages.REGISTRATION_ERROR);
        }
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        await ctx.reply(messages.REGISTRATION_ERROR);
      }

      delete ctx.session.registrationState;
      delete ctx.session.registrationData;
    }
  });

  bot.action('change_language', async (ctx) => {
    const keyboards = getUserKeyboards(ctx.locale);
    
    await ctx.editMessageReplyMarkup({
      inline_keyboard: keyboards.LANGUAGE,
    });
  });

  bot.action(/^lang_(.+)$/, async (ctx) => {
    const locale = ctx.match[1];
    const telegramId = ctx.from?.id.toString();
    
    if (!telegramId || !ctx.user) return;

    try {
      const response = await apiService.updateUserLocale(telegramId, locale);
      
      if (response.success) {
        ctx.locale = locale;
        const messages = getUserMessages(locale);
        await ctx.editMessageText(messages.LANGUAGE_CHANGED);
      } else {
        const messages = getUserMessages(ctx.locale);
        await ctx.editMessageText(messages.ERROR_OCCURRED);
      }
    } catch (error) {
      console.error('Ошибка изменения языка:', error);
      const messages = getUserMessages(ctx.locale);
      await ctx.editMessageText(messages.ERROR_OCCURRED);
    }
  });

  bot.action('back_settings', async (ctx) => {
    const messages = getUserMessages(ctx.locale);
    const keyboards = getUserKeyboards(ctx.locale);
    
    await ctx.editMessageText(messages.SETTINGS_MENU, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: keyboards.SETTINGS,
      },
    });
  });

  bot.action('close', async (ctx) => {
    await ctx.deleteMessage();
  });
};