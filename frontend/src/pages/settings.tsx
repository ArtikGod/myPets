import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { UserSettings } from '../types';
import Layout from '../components/Layout';

const SettingsPage = () => {
  const { t } = useTranslation('common');
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    language: 'ru',
    timezone: 'Europe/Moscow',
    notifications: {
      email: true,
      telegram: true,
      dailyReminder: true,
      weeklyReport: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setSettings({
        language: (user.locale as 'ru' | 'en') || 'ru',
        timezone: user.timezone || 'Europe/Moscow',
        notifications: {
          email: true,
          telegram: true,
          dailyReminder: true,
          weeklyReport: false,
        },
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          locale: settings.language,
          timezone: settings.timezone,
          notifications: settings.notifications,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await updateUser(data.data);
        setMessage({ type: 'success', text: t('settings.saved') });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('errors.serverError') });
    } finally {
      setLoading(false);
    }
  };

  const timezones = [
    { value: 'Europe/Moscow', label: 'Moscow (UTC+3)' },
    { value: 'Europe/London', label: 'London (UTC+0)' },
    { value: 'Europe/Berlin', label: 'Berlin (UTC+1)' },
    { value: 'America/New_York', label: 'New York (UTC-5)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)' },
  ];

  return (
    <Layout>
      <Head>
        <title>{t('settings.title')} - {t('title')}</title>
        <meta name="description" content={t('settings.description')} />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('settings.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('settings.description')}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`rounded-md p-4 mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm ${
              message.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {message.text}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('settings.profile')}
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">{t('name')}</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="input bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('settings.nameReadonly')}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('email')}</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('settings.emailReadonly')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Timezone */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('settings.localization')}
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">{t('settings.language')}</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      language: e.target.value as 'ru' | 'en' 
                    }))}
                    className="input"
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('settings.timezone')}</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      timezone: e.target.value 
                    }))}
                    className="input"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('settings.notifications')}
              </h2>
            </div>
            <div className="card-body space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {t('settings.emailNotifications')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('settings.emailNotificationsDesc')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: e.target.checked,
                        },
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {t('settings.telegramNotifications')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('settings.telegramNotificationsDesc')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.telegram}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          telegram: e.target.checked,
                        },
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {t('settings.dailyReminder')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('settings.dailyReminderDesc')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.dailyReminder}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          dailyReminder: e.target.checked,
                        },
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {t('settings.weeklyReport')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('settings.weeklyReportDesc')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyReport}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          weeklyReport: e.target.checked,
                        },
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary px-8 py-2"
            >
              {loading ? (
                <>
                  <div className="spinner h-4 w-4 mr-2"></div>
                  {t('loading')}
                </>
              ) : (
                t('settings.save')
              )}
            </button>
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

export default SettingsPage;