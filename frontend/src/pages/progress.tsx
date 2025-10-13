import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { ProgressStats } from '../types';
import Layout from '../components/Layout';

const ProgressPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/progress?range=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch progress stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, timeRange]);

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return '🔥';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '💪';
    return '🌱';
  };

  return (
    <Layout>
      <Head>
        <title>{t('progress.title')} - {t('title')}</title>
        <meta name="description" content={t('progress.description')} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('progress.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('progress.description')}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t(`progress.${range}`)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stats-card animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stats-card">
                <div className="stats-number text-blue-600">
                  {stats.total.received}
                </div>
                <div className="stats-label">{t('progress.received')}</div>
              </div>
              
              <div className="stats-card">
                <div className="stats-number text-green-600">
                  {stats.total.completed}
                </div>
                <div className="stats-label">{t('progress.completed')}</div>
              </div>
              
              <div className="stats-card">
                <div className="stats-number text-purple-600">
                  {Math.round(stats.total.rate)}%
                </div>
                <div className="stats-label">{t('progress.rate')}</div>
              </div>
              
              <div className="stats-card">
                <div className="stats-number text-orange-600">
                  {getStreakIcon(stats.streak.current)} {stats.streak.current}
                </div>
                <div className="stats-label">{t('progress.streak')}</div>
              </div>
            </div>

            {/* Detailed Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress by Period */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('progress.byPeriod')}
                  </h2>
                </div>
                <div className="card-body space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('progress.today')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stats.today.completed}/{stats.today.received}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${getProgressColor(stats.today.rate)}`}
                        style={{ width: `${stats.today.rate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(stats.today.rate)}% {t('progress.completed')}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('progress.week')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stats.week.completed}/{stats.week.received}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${getProgressColor(stats.week.rate)}`}
                        style={{ width: `${stats.week.rate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(stats.week.rate)}% {t('progress.completed')}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('progress.month')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stats.month.completed}/{stats.month.received}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${getProgressColor(stats.month.rate)}`}
                        style={{ width: `${stats.month.rate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(stats.month.rate)}% {t('progress.completed')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('progress.streakInfo')}
                  </h2>
                </div>
                <div className="card-body">
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-2">
                      {getStreakIcon(stats.streak.current)}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stats.streak.current}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('progress.currentStreak')}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {t('progress.longestStreak')}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {stats.streak.longest}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      {stats.streak.current >= 7 && (
                        <p className="mb-2">🎉 {t('progress.weekStreak')}</p>
                      )}
                      {stats.streak.current >= 30 && (
                        <p className="mb-2">🏆 {t('progress.monthStreak')}</p>
                      )}
                      <p>{t('progress.streakMotivation')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-8">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('progress.achievements')}
                  </h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      stats.total.completed >= 1 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="text-2xl mb-2">🌱</div>
                      <div className="font-medium text-gray-900">
                        {t('progress.firstStep')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('progress.firstStepDesc')}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      stats.streak.longest >= 7 
                        ? 'border-blue-200 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="text-2xl mb-2">💪</div>
                      <div className="font-medium text-gray-900">
                        {t('progress.weekWarrior')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('progress.weekWarriorDesc')}
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      stats.total.completed >= 30 
                        ? 'border-purple-200 bg-purple-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="font-medium text-gray-900">
                        {t('progress.champion')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('progress.championDesc')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('progress.noData')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('progress.noDataDesc')}
            </p>
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

export default ProgressPage;