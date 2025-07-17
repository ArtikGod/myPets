import React, { useState, useCallback } from 'react';
import { getUrlInfo, getAnalytics } from '../api/api';

interface UrlInfoType {
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
}

interface AnalyticsType {
  clickCount: number;
  last5IPs: string[];
}

const cleanIp = (ip: string) => ip.replace('::ffff:', '');

const UrlInfo: React.FC = () => {
  const [shortUrl, setShortUrl] = useState('');
  const [info, setInfo] = useState<UrlInfoType | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = useCallback(async () => {
    const trimmedShortUrl = shortUrl.trim();
    if (!trimmedShortUrl) return;

    setLoading(true);
    setError('');
    setInfo(null);
    setAnalytics(null);

    try {
      const [urlInfo, analyticsData] = await Promise.all([
        getUrlInfo(trimmedShortUrl),
        getAnalytics(trimmedShortUrl),
      ]);
      console.log('URL info:', urlInfo);
      console.log('Analytics data:', analyticsData);

      // Защита на случай, если last5IPs не массив
      const safeAnalyticsData = {
        ...analyticsData,
        last5IPs: Array.isArray(analyticsData.last5IPs) ? analyticsData.last5IPs : [],
      };

      setInfo(urlInfo);
      setAnalytics(safeAnalyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }, [shortUrl]);

  return (
    <div className="url-info">
      <div className="search-box">
        <label htmlFor="shortUrlInput" className="visually-hidden">
          Enter short URL
        </label>
        <input
          id="shortUrlInput"
          type="text"
          value={shortUrl}
          onChange={(e) => setShortUrl(e.target.value)}
          placeholder="Enter short URL"
          aria-label="Short URL input"
          disabled={loading}
        />
        <button onClick={handleLookup} disabled={loading || !shortUrl.trim()}>
          {loading ? 'Loading...' : 'Get Info'}
        </button>
      </div>

      {error && <div className="error" role="alert">{error}</div>}

      {info && (
        <div className="info-section" aria-live="polite">
          <h3>URL Information</h3>
          <p>
            <strong>Original URL:</strong>{' '}
            <a href={info.originalUrl} target="_blank" rel="noopener noreferrer">
              {info.originalUrl}
            </a>
          </p>
          <p>
            <strong>Short URL:</strong> {info.shortUrl}
          </p>
          <p>
            <strong>Total Clicks:</strong> {info.clickCount}
          </p>

          <div className="analytics-section">
            <h3>Analytics</h3>
            {analytics ? (
              <>
                <p>
                  <strong>Total Transitions:</strong> {analytics.clickCount}
                </p>
                <h4>Last 5 IP Addresses:</h4>
                {analytics.last5IPs.length > 0 ? (
                  <ul>
                    {analytics.last5IPs.map((ip, idx) => (
                      <li key={idx}>{cleanIp(ip)}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No visits recorded yet</p>
                )}
              </>
            ) : (
              <p>Loading analytics...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlInfo;
