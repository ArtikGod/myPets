import React, { useEffect, useState, useRef } from 'react';
import { getAllUrls, deleteUrl } from '../api/api';

interface Url {
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
}

interface UrlTableProps {
  refresh: number;
}

const UrlTable: React.FC<UrlTableProps> = ({ refresh }) => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingUrls, setDeletingUrls] = useState<Set<string>>(new Set());

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchUrls = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllUrls();
        if (isMounted.current) {
          setUrls(data);
          setError('');
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to load URLs');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchUrls();

    return () => {
      isMounted.current = false;
    };
  }, [refresh]);

  const handleDelete = async (shortUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) return;

    setDeletingUrls((prev) => new Set(prev).add(shortUrl));

    try {
      await deleteUrl(shortUrl);
      if (isMounted.current) {
        setUrls((prev) => prev.filter((url) => url.shortUrl !== shortUrl));
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to delete URL');
      }
    } finally {
      if (isMounted.current) {
        setDeletingUrls((prev) => {
          const newSet = new Set(prev);
          newSet.delete(shortUrl);
          return newSet;
        });
      }
    }
  };

  if (loading) return <div className="loading">Loading URLs...</div>;
  if (error) return <div className="error-message" role="alert">{error}</div>;

  return (
    <div className="url-table">
      <h2>All URLs</h2>
      <table>
        <thead>
          <tr>
            <th>Original URL</th>
            <th>Short URL</th>
            <th>Clicks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                No URLs found.
              </td>
            </tr>
          ) : (
            urls.map((url) => (
              <tr key={url.shortUrl}>
                <td>
                  <a
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={url.originalUrl}
                  >
                    {url.originalUrl.length > 50
                      ? `${url.originalUrl.substring(0, 50)}...`
                      : url.originalUrl}
                  </a>
                </td>
                <td>
                  <a
                    href={`/${url.shortUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {url.shortUrl}
                  </a>
                </td>
                <td>{url.clickCount}</td>
                <td>
                  <button
                    onClick={() => handleDelete(url.shortUrl)}
                    className="delete-btn"
                    disabled={deletingUrls.has(url.shortUrl)}
                    aria-label={`Delete short URL ${url.shortUrl}`}
                  >
                    {deletingUrls.has(url.shortUrl) ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UrlTable;
