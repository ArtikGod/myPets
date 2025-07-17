import React, { useState } from 'react';
import { createShortUrl } from '../api/api';

interface Props {
  onCreated: () => void;
}

const INITIAL_FORM = {
  originalUrl: '',
  alias: '',
  expiresAt: '',
};

const MAX_ALIAS_LENGTH = 20;

const CreateForm: React.FC<Props> = ({ onCreated }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({
    loading: false,
    error: '',
    success: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => setForm(INITIAL_FORM);
  const resetStatus = () => setStatus({ loading: false, error: '', success: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const result = await createShortUrl({
        originalUrl: form.originalUrl,
        alias: form.alias || undefined,
        expiresAt: form.expiresAt || undefined,
      });

      setStatus({
        loading: false,
        error: '',
        success: `Created: ${result.data.shortUrl}`, // ← уточни, что вернёт backend
      });

      resetForm();
      onCreated();
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Creation failed',
        success: '',
      });
    }
  };

  return (
    <div className="create-form">
      <h2>Create Short URL</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="originalUrl">Original URL *</label>
          <input
            id="originalUrl"
            name="originalUrl"
            type="url"
            value={form.originalUrl}
            onChange={handleChange}
            required
            disabled={status.loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="alias">Custom Alias (optional)</label>
          <input
            id="alias"
            name="alias"
            type="text"
            maxLength={MAX_ALIAS_LENGTH}
            value={form.alias}
            onChange={handleChange}
            disabled={status.loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="expiresAt">Expiration (optional)</label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="datetime-local"
            value={form.expiresAt}
            onChange={handleChange}
            disabled={status.loading}
          />
        </div>

        <button type="submit" disabled={status.loading}>
          {status.loading ? 'Creating...' : 'Create URL'}
        </button>

        {status.error && <div className="error-message">{status.error}</div>}
        {status.success && <div className="success-message">{status.success}</div>}
      </form>
    </div>
  );
};

export default CreateForm;
