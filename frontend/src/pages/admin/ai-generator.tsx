import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';

interface AIStatus {
  aiEnabled: boolean;
  status: string;
  message: string;
}

const AIGeneratorPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedExercises, setGeneratedExercises] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    count: 3,
    category: 'mindfulness',
    difficulty: 'medium',
    language: 'ru',
    userContext: '',
  });

  useEffect(() => {
    const fetchAIStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ai/status');
        
        if (response.ok) {
          const data = await response.json();
          setAIStatus(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch AI status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIStatus();
  }, []);

  const handleGenerateExercises = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setGenerating(true);
      const response = await fetch('/api/ai/generate-bulk-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedExercises(data.data.exercises || []);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate exercises');
      }
    } catch (error) {
      console.error('Failed to generate exercises:', error);
      alert('Failed to generate exercises');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCustomTask = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/ai/generate-custom-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          category: formData.category,
          difficulty: formData.difficulty,
          language: formData.language,
          userContext: formData.userContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(t('ai.customTaskGenerated'));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate custom task');
      }
    } catch (error) {
      console.error('Failed to generate custom task:', error);
      alert('Failed to generate custom task');
    } finally {
      setGenerating(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('errors.forbidden')}
          </h1>
          <p className="text-gray-600">
            {t('admin.accessDenied')}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t('ai.title')} - {t('title')}</title>
        <meta name="description" content={t('ai.description')} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('ai.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('ai.description')}
          </p>
        </div>

        {/* AI Status */}
        <div className="mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('ai.status')}
              </h2>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ) : aiStatus ? (
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    aiStatus.aiEnabled ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">
                      {aiStatus.aiEnabled ? t('ai.enabled') : t('ai.disabled')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {aiStatus.message}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{t('ai.statusUnknown')}</p>
              )}
            </div>
          </div>
        </div>

        {aiStatus?.aiEnabled && (
          <>
            {/* Generation Form */}
            <div className="mb-8">
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {t('ai.generateExercises')}
                  </h2>
                </div>
                <div className="card-body">
                  <form onSubmit={handleGenerateExercises} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="form-label">{t('ai.count')}</label>
                        <select
                          value={formData.count}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            count: parseInt(e.target.value) 
                          }))}
                          className="input"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t('tasks.category')}</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            category: e.target.value 
                          }))}
                          className="input"
                        >
                          <option value="mindfulness">{t('ai.categories.mindfulness')}</option>
                          <option value="meditation">{t('ai.categories.meditation')}</option>
                          <option value="breathing">{t('ai.categories.breathing')}</option>
                          <option value="gratitude">{t('ai.categories.gratitude')}</option>
                          <option value="reflection">{t('ai.categories.reflection')}</option>
                          <option value="relaxation">{t('ai.categories.relaxation')}</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t('tasks.difficulty')}</label>
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            difficulty: e.target.value 
                          }))}
                          className="input"
                        >
                          <option value="easy">{t('ai.difficulty.easy')}</option>
                          <option value="medium">{t('ai.difficulty.medium')}</option>
                          <option value="hard">{t('ai.difficulty.hard')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">{t('settings.language')}</label>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            language: e.target.value 
                          }))}
                          className="input"
                        >
                          <option value="ru">Русский</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">{t('ai.context')}</label>
                        <input
                          type="text"
                          value={formData.userContext}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            userContext: e.target.value 
                          }))}
                          className="input"
                          placeholder={t('ai.contextPlaceholder')}
                          maxLength={500}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={generating}
                        className="btn-primary"
                      >
                        {generating ? (
                          <>
                            <div className="spinner h-4 w-4 mr-2"></div>
                            {t('ai.generating')}
                          </>
                        ) : (
                          t('ai.generateExercises')
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerateCustomTask}
                        disabled={generating}
                        className="btn-secondary"
                      >
                        {t('ai.generateCustomTask')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Generated Exercises */}
            {generatedExercises.length > 0 && (
              <div className="mb-8">
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t('ai.generatedExercises')} ({generatedExercises.length})
                    </h2>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {generatedExercises.map((exercise, index) => (
                        <div key={exercise.id || index} className="border rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">
                            {exercise.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {exercise.description}
                          </p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span className="badge-info">
                              {exercise.category}
                            </span>
                            <span>
                              {t('ai.order')}: {exercise.order}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!aiStatus?.aiEnabled && !loading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('ai.notConfigured')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('ai.notConfiguredDescription')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale, req }) => {
  // Check if user is authenticated and is admin
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

export default AIGeneratorPage;