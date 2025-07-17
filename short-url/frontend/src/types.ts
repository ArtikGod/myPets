export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  alias?: string | null;
  expiresAt?: string | null;
  clickCount: number;
  createdAt: string;
}

export interface AnalyticsData {
  clickCount: number;
  recentIps: string[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface CreateShortUrlRequest {
  originalUrl: string;
  expiresAt?: string;
  alias?: string;
}