import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskFilter } from '../types';
import Layout from '../components/Layout';

const TasksPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>({
    status: 'all',
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (filter.status && filter.status !== 'all') {
          params.append('status', filter.status.toUpperCase());
        }
        if (filter.dateFrom) {
          params.append('dateFrom', filter.dateFrom);
        }
        if (filter.dateTo) {
          params.append('dateTo', filter.dateTo);
        }

        const response = await fetch(`/api/tasks?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setTasks(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user, filter]);

  const handleStatusChange = (status: string) => {
    setFilter(prev => ({ ...prev, status: status as any }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge-success">{t('dashboard.completed')}</span>;
      case 'SKIPPED':
        return <span className="badge-warning">{t('dashboard.skipped')}</span>;
      default:
        return <span className="badge-info">{t('dashboard.pending')}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(user?.locale || 'ru', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const grouped: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      const date = new Date(task.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });
    
    return grouped;
  };

  const groupedTasks = groupTasksByDate(tasks);
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Layout>
      <Head>
        <title>{t('tasks.title')} - {t('title')}</title>
        <meta name="description" content={t('tasks.description')} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('tasks.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('tasks.description')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">{t('tasks.filter')}</label>
              <select
                value={filter.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input"
              >
                <option value="all">{t('tasks.all')}</option>
                <option value="pending">{t('tasks.pending')}</option>
                <option value="completed">{t('tasks.completed')}</option>
                <option value="skipped">{t('tasks.skipped')}</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">{t('tasks.dateFrom')}</label>
              <input
                type="date"
                value={filter.dateFrom || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="input"
              />
            </div>
            
            <div>
              <label className="form-label">{t('tasks.dateTo')}</label>
              <input
                type="date"
                value={filter.dateTo || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                className="input"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ status: 'all' })}
                className="btn-outline w-full"
              >
                {t('tasks.clearFilters')}
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="card-body">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('tasks.noTasks')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('tasks.noTasksDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {formatDate(date)}
                </h2>
                <div className="space-y-4">
                  {groupedTasks[date].map(task => (
                    <div key={task.id} className="card">
                      <div className="card-body">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {task.exercise.title}
                          </h3>
                          {getStatusBadge(task.status)}
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                          {task.exercise.description}
                        </p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <div className="flex space-x-4">
                            <span>
                              {t('tasks.category')}: {task.exercise.category}
                            </span>
                          </div>
                          
                          {task.completedAt && (
                            <span>
                              {t('tasks.completedAt')}: {formatDate(task.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  // Check if user is authenticated
  const token = req.cookies.token;
  
  if (!token) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ru', ['common'])),
    },
  };
};

export default TasksPage;