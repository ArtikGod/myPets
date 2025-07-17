import { DEFAULT_API_URL, ERROR_MESSAGES, API_PATHS } from './api.constants.js';

const cleanUrl = (url: string) => url.replace(/\/+$/, '');
const API_URL = cleanUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL);

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('Content-Type');
  const data = contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = data?.message || ERROR_MESSAGES.DEFAULT;
    throw new Error(errorMessage);
  }

  return data;
};

export const createShortUrl = async (data: {
  originalUrl: string;
  alias?: string;
  expiresAt?: string;
}) => {
  const response = await fetch(`${API_URL}${API_PATHS.SHORTEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const getAllUrls = async () => {
  const response = await fetch(`${API_URL}${API_PATHS.ALL_URLS}`);
  return handleResponse(response);
};

export const getUrlInfo = async (shortUrl: string) => {
  const response = await fetch(`${API_URL}${API_PATHS.INFO}/${encodeURIComponent(shortUrl)}`);
  return handleResponse(response);
};

export const getAnalytics = async (shortUrl: string) => {
  const response = await fetch(`${API_URL}${API_PATHS.ANALYTICS}/${encodeURIComponent(shortUrl)}`);
  const data = await handleResponse(response);
  return {
    last5IPs: data.last5IPs || [],
    clickCount: data.clickCount || 0,
  };
};

export const deleteUrl = async (shortUrl: string) => {
  const response = await fetch(`${API_URL}${API_PATHS.DELETE}/${encodeURIComponent(shortUrl)}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};
