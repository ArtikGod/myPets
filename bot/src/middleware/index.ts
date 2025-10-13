import { Context, Telegraf } from 'telegraf';
import { apiService, UserData } from '../services/apiService';
import { MESSAGES, DEFAULT_LOCALE } from '../constants';

export interface BotContext extends Context {
  user?: UserData;
  locale: string;
  session: {
    registrationState?: string;
    registrationData?: {
      name?: string;
      email?: string;
    };
  };
}

export const setupMiddleware = (bot: Telegraf<BotContext>) => {
  bot.use(async (ctx, next) => {
    if (!ctx.session) {
      ctx.session = {};
    }
    
    ctx.locale = DEFAULT_LOCALE;
    
    if (ctx.from) {
      const telegramId = ctx.from.id.toString();
      
      try {
        const response = await apiService.getUserByTelegramId(telegramId);
        
        if (response.success && response.data) {
          ctx.user = response.data.user;
          ctx.locale = response.data.user.locale || DEFAULT_LOCALE;
        }
      } catch (error) {
        console.error('Ошибка получения пользователя в middleware:', error);
      }
    }
    
    return next();
  });

  bot.use(async (ctx, next) => {
    const start = Date.now();
    
    try {
      await next();
    } catch (error) {
      console.error('Ошибка в обработчике команды:', error);
      
      const messages = ctx.locale === 'en' ? MESSAGES.EN : MESSAGES.RU;
      await ctx.reply(messages.ERROR_OCCURRED);
    }
    
    const duration = Date.now() - start;
    const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
    const callbackData = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
    const commandInfo = messageText || callbackData || 'неизвестная команда';
    console.log(`Команда ${commandInfo} выполнена за ${duration}ms`);
  });

  bot.catch((err, ctx) => {
    console.error('Необработанная ошибка бота:', err);
    
    const messages = ctx.locale === 'en' ? MESSAGES.EN : MESSAGES.RU;
    ctx.reply(messages.ERROR_OCCURRED).catch(console.error);
  });
};

export const requireAuth = () => {
  return async (ctx: BotContext, next: () => Promise<void>) => {
    if (!ctx.user) {
      const messages = ctx.locale === 'en' ? MESSAGES.EN : MESSAGES.RU;
      await ctx.reply(messages.USER_NOT_REGISTERED);
      return;
    }
    
    return next();
  };
};

export const formatMessage = (template: string, params: Record<string, any>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key].toString() : match;
  });
};

export const getUserMessages = (locale: string) => {
  return locale === 'en' ? MESSAGES.EN : MESSAGES.RU;
};

export const getUserKeyboards = (locale: string) => {
  const { KEYBOARDS } = require('../constants');
  return locale === 'en' ? KEYBOARDS.EN : KEYBOARDS.RU;
};