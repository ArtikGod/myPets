import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '../services/api';
import { Task, ProgressStats, TaskQuery, TaskContextType } from '../types';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [todayTask, setTodayTask] = useState<Task | null>(null);
  const [taskHistory, setTaskHistory] = useState<Task[]>([]);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTodayTask = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getTodayTask();
      
      if (response.success && response.data) {
        setTodayTask(response.data.task);
      } else {
        setError(response.error || 'Ошибка получения задания');
        setTodayTask(null);
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка получения задания');
      setTodayTask(null);
    } finally {
      setLoading(false);
    }
  };

  const getTaskHistory = async (query?: TaskQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getTaskHistory(query);
      
      if (response.success && response.data) {
        setTaskHistory(response.data);
      } else {
        setError(response.error || 'Ошибка получения истории');
        setTaskHistory([]);
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка получения истории');
      setTaskHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProgress();
      
      if (response.success && response.data) {
        setProgress(response.data.progress);
      } else {
        setError(response.error || 'Ошибка получения прогресса');
        setProgress(null);
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка получения прогресса');
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.completeTask(taskId);
      
      if (response.success && response.data) {
        setTodayTask(response.data.task);
        // Обновляем прогресс после выполнения задания
        await getProgress();
      } else {
        setError(response.error || 'Ошибка выполнения задания');
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка выполнения задания');
    } finally {
      setLoading(false);
    }
  };

  const skipTask = async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.skipTask(taskId);
      
      if (response.success && response.data) {
        setTodayTask(response.data.task);
      } else {
        setError(response.error || 'Ошибка пропуска задания');
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка пропуска задания');
    } finally {
      setLoading(false);
    }
  };

  const value: TaskContextType = {
    todayTask,
    taskHistory,
    progress,
    loading,
    error,
    getTodayTask,
    getTaskHistory,
    getProgress,
    completeTask,
    skipTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};