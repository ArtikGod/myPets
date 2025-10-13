import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  locale: string;
  telegramId?: string;
}

export interface TaskData {
  id: string;
  text: string;
  textEn?: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
  exercise: {
    id: string;
    title: string;
    titleEn?: string;
    category: string;
    categoryEn?: string;
  };
}

export interface ProgressData {
  today: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
  };
  week: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
    streak: number;
  };
  month: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
  };
  total: {
    tasksReceived: number;
    tasksCompleted: number;
    completionRate: number;
    longestStreak: number;
  };
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.BACKEND_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async registerTelegramUser(telegramId: string, name: string, email: string, locale: string = 'ru'): Promise<ApiResponse<{ user: UserData; token: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: UserData; token: string }>> = await this.api.post('/auth/telegram', {
        telegramId,
        name,
        email,
        locale,
      });
      return response.data;
    } catch (error: any) {
      console.error('Ошибка регистрации пользователя:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка регистрации',
      };
    }
  }

  async getUserByTelegramId(telegramId: string): Promise<ApiResponse<{ user: UserData }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: UserData }>> = await this.api.get(`/users/telegram/${telegramId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
        };
      }
      console.error('Ошибка получения пользователя:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка получения пользователя',
      };
    }
  }

  async getTodayTask(telegramId: string): Promise<ApiResponse<{ task: TaskData }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ task: TaskData }>> = await this.api.get('/tasks/today', {
        headers: {
          'X-Telegram-ID': telegramId,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Ошибка получения задания:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка получения задания',
      };
    }
  }

  async completeTask(telegramId: string, taskId: string): Promise<ApiResponse<{ task: TaskData }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ task: TaskData }>> = await this.api.post(`/tasks/${taskId}/complete`, {}, {
        headers: {
          'X-Telegram-ID': telegramId,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Ошибка выполнения задания:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка выполнения задания',
      };
    }
  }

  async getUserProgress(telegramId: string): Promise<ApiResponse<{ progress: ProgressData }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ progress: ProgressData }>> = await this.api.get('/progress', {
        headers: {
          'X-Telegram-ID': telegramId,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Ошибка получения прогресса:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка получения прогресса',
      };
    }
  }

  async updateUserLocale(telegramId: string, locale: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.put('/auth/profile', 
        { locale },
        {
          headers: {
            'X-Telegram-ID': telegramId,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Ошибка обновления языка:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка обновления языка',
      };
    }
  }

  async updateUserTimezone(telegramId: string, timezone: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.put('/auth/profile', 
        { timezone },
        {
          headers: {
            'X-Telegram-ID': telegramId,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Ошибка обновления часового пояса:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка обновления часового пояса',
      };
    }
  }

  async getActiveUsers(): Promise<ApiResponse<{ users: any[] }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ users: any[] }>> = await this.api.get('/admin/users?isActive=true');
      return response.data;
    } catch (error: any) {
      console.error('Ошибка получения активных пользователей:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Ошибка получения пользователей',
      };
    }
  }
}

export const apiService = new ApiService();