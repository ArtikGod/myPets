export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  locale: string;
  isActive: boolean;
  telegramId?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: string;
  categoryEn?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  text: string;
  textEn?: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  exercise: {
    id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    category: string;
    categoryEn?: string;
  };
}

export interface CustomTask {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  completedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStats {
  today: {
    received: number;
    completed: number;
    rate: number;
  };
  week: {
    received: number;
    completed: number;
    rate: number;
  };
  month: {
    received: number;
    completed: number;
    rate: number;
  };
  total: {
    received: number;
    completed: number;
    rate: number;
  };
  streak: {
    current: number;
    longest: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  locale?: string;
}

export interface TaskQuery {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  dateFrom?: string;
  dateTo?: string;
}

export interface ExerciseRequest {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  category: string;
  categoryEn?: string;
  order?: number;
  isActive?: boolean;
}

export interface CustomTaskRequest {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  isActive?: boolean;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    new: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  exercises: {
    total: number;
    active: number;
  };
}

export type Locale = 'ru' | 'en';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface TaskContextType {
  todayTask: Task | null;
  taskHistory: Task[];
  progress: ProgressStats | null;
  loading: boolean;
  error: string | null;
  getTodayTask: () => Promise<void>;
  getTaskHistory: (query?: TaskQuery) => Promise<void>;
  getProgress: () => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  skipTask: (taskId: string) => Promise<void>;
}
// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Filter types
export interface TaskFilter {
  status?: 'all' | 'pending' | 'completed' | 'skipped';
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}

// Settings types
export interface UserSettings {
  language: 'ru' | 'en';
  timezone: string;
  notifications: {
    email: boolean;
    telegram: boolean;
    dailyReminder: boolean;
    weeklyReport: boolean;
  };
}
