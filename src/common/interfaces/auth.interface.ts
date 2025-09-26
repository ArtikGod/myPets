import { User } from '../../users/entities/user.entity';

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: number;
  email: string;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}