import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import { Exercise } from '../../types';
import Layout from '../../components/Layout';

const AdminExercisesPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    category: '',
    categoryEn: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (searchTerm) {
          params.append('search', searchTerm);
        }
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }

        const response = await fetch(`/api/admin/exercises?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setExercises(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'ADMIN') {
      fetchExercises();
    }
  }, [user, searchTerm, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingExercise 
        ? `/api/admin/exercises/${editingExercise.id}`
        : '/api/admin/exercises';
      
      const method = editingExercise ? 'PUT' : 'POST';
      
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
        
        if (editingExercise) {
          setExercises(prev => prev.map(ex => 
            ex.id === editingExercise.id ? data.data : ex
          ));
        } else {
          setExercises(prev => [...prev, data.data]);
        }
        
        handleCloseModal();
      }
    } catch (error) {
      console.error('Failed to save exercise:', error);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      title: exercise.title,
      titleEn: exercise.titleEn || '',
      description: exercise.description,
      descriptionEn: exercise.descriptionEn || '',
      category: exercise.category,
      categoryEn: exercise.categoryEn || '',
      order: exercise.order,
      isActive: exercise.isActive,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (exerciseId: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    
    try {
      const response = await fetch(`/api/admin/exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  };

  const handleToggleActive = async (exerciseId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/exercises/${exerciseId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setExercises(prev => prev.map(ex => 
          ex.id === exerciseId ? { ...ex, isActive } : ex
        ));
      }
    } catch (error) {
      console.error('Failed to update exercise status:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingExercise(null);
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      category: '',
      categoryEn: '',
      order: 0,
      isActive: true,
    });
  };

  const categories = [...new Set(exercises.map(ex => ex.category))];

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
        <title>{t('admin.exercises')} - {t('title')}</title>
        <meta name="description" content={t('admin.exercisesDescription')} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('admin.exercises')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('admin.exercisesDescription')}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            {t('admin.createExercise')}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">{t('search')}</label>
              <input
                type="text"
                placeholder={t('admin.searchExercises')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            
            <div>
              <label className="form-label">{t('tasks.category')}</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                <option value="all">{t('tasks.all')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercises Grid */}
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
        ) : exercises.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('admin.noExercises')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('admin.noExercisesDescription')}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                {t('admin.createExercise')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {exercise.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exercise.isActive}
                          onChange={(e) => handleToggleActive(exercise.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {exercise.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span className="badge-info">
                      {exercise.category}
                    </span>
                    <span>
                      {t('admin.order')}: {exercise.order}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      {t('delete')}
                    </button>
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
                    {editingExercise ? t('admin.editExercise') : t('admin.createExercise')}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">{t('admin.titleRu')}</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="input"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">{t('admin.titleEn')}</label>
                        <input
                          type="text"
                          value={formData.titleEn}
                          onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                          className="input"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">{t('admin.categoryRu')}</label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="input"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">{t('admin.categoryEn')}</label>
                        <input
                          type="text"
                          value={formData.categoryEn}
                          onChange={(e) => setFormData(prev => ({ ...prev, categoryEn: e.target.value }))}
                          className="input"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">{t('admin.descriptionRu')}</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="input"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">{t('admin.descriptionEn')}</label>
                      <textarea
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                        className="input"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label">{t('admin.order')}</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                          className="input"
                          min="0"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {t('admin.isActive')}
                          </span>
                        </label>
                      </div>
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
                        {editingExercise ? t('update') : t('create')}
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

export default AdminExercisesPage;