import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { 
  ApiResponse, 
  User, 
  Task, 
  Exercise, 
  CustomTask, 
  ProgressStats, 
  LoginRequest, 
  RegisterRequest,
  TaskQuery,
  ExerciseRequest,
  CustomTaskRequest,
  AdminStats
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
        await this.api.post('/auth/login', data);
      
      if (response.data.success && response.data.data?.token) {
        Cookies.set('token', response.data.data.token, { expires: 7 });
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = 
        await this.api.post('/auth/register', data);
      
      if (response.data.success && response.data.data?.token) {
        Cookies.set('token', response.data.data.token, { expires: 7 });
      }
      
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
    }
  }

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = 
        await this.api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = 
        await this.api.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Task endpoints
  async getTodayTask(): Promise<ApiResponse<{ task: Task }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ task: Task }>> = 
        await this.api.get('/tasks/today');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getTaskHistory(query?: TaskQuery): Promise<ApiResponse<Task[]>> {
    try {
      const params = new URLSearchParams();
      if (query?.page) params.append('page', query.page.toString());
      if (query?.limit) params.append('limit', query.limit.toString());
      if (query?.status) params.append('status', query.status);
      if (query?.dateFrom) params.append('dateFrom', query.dateFrom);
      if (query?.dateTo) params.append('dateTo', query.dateTo);

      const response: AxiosResponse<ApiResponse<Task[]>> = 
        await this.api.get(`/tasks/history?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async completeTask(taskId: string): Promise<ApiResponse<{ task: Task }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ task: Task }>> = 
        await this.api.post(`/tasks/${taskId}/complete`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async skipTask(taskId: string): Promise<ApiResponse<{ task: Task }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ task: Task }>> = 
        await this.api.post(`/tasks/${taskId}/skip`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Progress endpoint
  async getProgress(): Promise<ApiResponse<{ progress: ProgressStats }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ progress: ProgressStats }>> = 
        await this.api.get('/progress');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Exercise endpoints (Admin)
  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Exercise[]>> = 
        await this.api.get('/exercises');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createExercise(data: ExerciseRequest): Promise<ApiResponse<{ exercise: Exercise }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ exercise: Exercise }>> = 
        await this.api.post('/exercises', data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateExercise(id: string, data: Partial<ExerciseRequest>): Promise<ApiResponse<{ exercise: Exercise }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ exercise: Exercise }>> = 
        await this.api.put(`/exercises/${id}`, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteExercise(id: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await this.api.delete(`/exercises/${id}`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Custom Task endpoints
  async getCustomTasks(): Promise<ApiResponse<CustomTask[]>> {
    try {
      const response: AxiosResponse<ApiResponse<CustomTask[]>> = 
        await this.api.get('/custom-tasks');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createCustomTask(data: CustomTaskRequest): Promise<ApiResponse<{ customTask: CustomTask }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ customTask: CustomTask }>> = 
        await this.api.post('/custom-tasks', data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateCustomTask(id: string, data: Partial<CustomTaskRequest>): Promise<ApiResponse<{ customTask: CustomTask }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ customTask: CustomTask }>> = 
        await this.api.put(`/custom-tasks/${id}`, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteCustomTask(id: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await this.api.delete(`/custom-tasks/${id}`);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Admin endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response: AxiosResponse<ApiResponse<User[]>> = 
        await this.api.get('/admin/users');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
      const response: AxiosResponse<ApiResponse<AdminStats>> = 
        await this.api.get('/admin/stats');
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // AI endpoints
  async generateExercise(data: { category?: string; locale?: string; prompt?: string }): Promise<ApiResponse<Exercise>> {
    try {
      const response: AxiosResponse<ApiResponse<Exercise>> = 
        await this.api.post('/ai/generate-exercise', data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    console.error('API Error:', error);
    
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      error: error.message || 'Произошла ошибка при выполнении запроса',
    };
  }
}

export const apiService = new ApiService();
export default apiService;