import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { CustomTask } from '../types';
import Layout from '../components/Layout';

const CustomTasksPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<CustomTask | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    titleEn: '',
    descriptionEn: '',
  });

  useEffect(() => {
    const fetchCustomTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/custom-tasks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setCustomTasks(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch custom tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCustomTasks();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTask 
        ? `/api/custom-tasks/${editingTask.id}`
        : '/api/custom-tasks';
      
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (editingTask) {
          setCustomTasks(prev => prev.map(task => 
            task.id === editingTask.id ? data.data : task
          ));
        } else {
          setCustomTasks(prev => [data.data, ...prev]);
        }
        
        handleCloseModal();
      }
    } catch (error) {
      console.error('Failed to save custom task:', error);
    }
  };

  const handleEdit = (task: CustomTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      titleEn: task.titleEn || '',
      descriptionEn: task.descriptionEn || '',
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm(t('customTasks.confirmDelete'))) return;
    
    try {
      const response = await fetch(`/api/custom-tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setCustomTasks(prev => prev.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete custom task:', error);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/custom-tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomTasks(prev => prev.map(task => 
          task.id === taskId ? data.data : task
        ));
      }
    } catch (error) {
      console.error('Failed to complete custom task:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      titleEn: '',
      descriptionEn: '',
    });
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
    return new Date(dateString).toLocaleDateString(user?.locale || 'ru', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <Head>
        <title>{t('customTasks.title')} - {t('title')}</title>
        <meta name="description" content={t('customTasks.description')} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('customTasks.title')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('customTasks.description')}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            {t('customTasks.create')}
          </button>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : customTasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('customTasks.noTasks')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('customTasks.noTasksDescription')}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                {t('customTasks.create')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTasks.map((task) => (
              <div key={task.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {task.title}
                    </h3>
                    {getStatusBadge(task.status)}
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {task.description}
                  </p>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    {t('customTasks.created')}: {formatDate(task.createdAt)}
                    {task.completedAt && (
                      <div>
                        {t('customTasks.completed')}: {formatDate(task.completedAt)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {task.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleComplete(task.id)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            {t('dashboard.complete')}
                          </button>
                          <button
                            onClick={() => handleEdit(task)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            {t('edit')}
                          </button>
                        </>
                      )}
                    </div>
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        {t('delete')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="modal">
            <div className="modal-backdrop" onClick={handleCloseModal}></div>
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="modal-content max-w-2xl w-full">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingTask ? t('customTasks.edit') : t('customTasks.create')}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">{t('customTasks.titleRu')}</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="input"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">{t('customTasks.titleEn')}</label>
                        <input
                          type="text"
                          value={formData.titleEn}
                          onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                          className="input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">{t('customTasks.descriptionRu')}</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="input"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">{t('customTasks.descriptionEn')}</label>
                      <textarea
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                        className="input"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="btn-outline"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                      >
                        {editingTask ? t('update') : t('create')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
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

export default CustomTasksPage;