import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { Task, ProgressStats } from '../types';
import Layout from '../components/Layout';

const DashboardPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { todayTask, completeTask, skipTask, loading } = useTask();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleSkipTask = async (taskId: string) => {
    try {
      await skipTask(taskId);
    } catch (error) {
      console.error('Failed to skip task:', error);
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge-success">{t('dashboard.completed')}</span>;
      case 'SKIPPED':
        return <span className="badge-warning">{t('dashboard.skipped')}</span>;
      default:
        return <span className="badge-info">{t('dashboard.pending')}</span>;
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t('dashboard.welcome', { name: user?.name || '' })} - {t('title')}</title>
        <meta name="description" content={t('description')} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome', { name: user?.name || '' })}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('description')}
          </p>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stats-card animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stats-card">
              <div className="stats-number">{stats.today.completed}</div>
              <div className="stats-label">{t('progress.today')}</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{stats.week.completed}</div>
              <div className="stats-label">{t('progress.week')}</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{stats.month.completed}</div>
              <div className="stats-label">{t('progress.month')}</div>
            </div>
            <div className="stats-card">
              <div className="stats-number">{stats.streak.current}</div>
              <div className="stats-label">{t('progress.streak')}</div>
            </div>
          </div>
        )}

        {/* Today's Task */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('dashboard.todayTask')}
                </h2>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : todayTask ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {todayTask.exercise.title}
                      </h3>
                      {getTaskStatusBadge(todayTask.status)}
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                      {todayTask.exercise.description}
                    </p>
                    
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">
                        {t('progress.category')}: {todayTask.exercise.category}
                      </span>
                    </div>
                    
                    {todayTask.status === 'PENDING' && (
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleCompleteTask(todayTask.id)}
                          className="btn-success"
                          disabled={loading}
                        >
                          {loading ? (
                            <div className="spinner h-4 w-4 mr-2"></div>
                          ) : null}
                          {t('dashboard.complete')}
                        </button>
                        <button
                          onClick={() => handleSkipTask(todayTask.id)}
                          className="btn-outline"
                          disabled={loading}
                        >
                          {t('dashboard.skip')}
                        </button>
                      </div>
                    )}
                    
                    {todayTask.status === 'COMPLETED' && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div className="ml-3">
                            <p className="text-sm text-green-800">
                              {t('dashboard.completed')}! {t('progress.great')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {t('dashboard.noTask')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('dashboard.noTaskDescription')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('progress.title')}
                </h2>
              </div>
              <div className="card-body">
                {loadingStats ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i}>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="progress-bar">
                          <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stats && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{t('progress.today')}</span>
                        <span>{stats.today.completed}/{stats.today.received}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${stats.today.rate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{t('progress.week')}</span>
                        <span>{stats.week.completed}/{stats.week.received}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${stats.week.rate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{t('progress.month')}</span>
                        <span>{stats.month.completed}/{stats.month.received}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${stats.month.rate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.streak.current}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t('progress.streak')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {t('progress.longestStreak')}: {stats.streak.longest}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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

export default DashboardPage;