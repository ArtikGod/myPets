import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, ApiResponse, Role } from '../types';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import prisma from '../utils/database';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization) || req.cookies?.token;

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
      } as ApiResponse);
      return;
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        isActive: true,
        telegramId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.USER_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
    } as ApiResponse);
  }
};

export const requireRole = (requiredRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.UNAUTHORIZED,
      } as ApiResponse);
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
      } as ApiResponse);
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(Role.ADMIN);

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization) || req.cookies?.token;

    if (token) {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          locale: true,
          timezone: true,
          isActive: true,
          telegramId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export const requireOwnershipOrAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    } as ApiResponse);
    return;
  }

  if (req.user.role === Role.ADMIN) {
    next();
    return;
  }

  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
  
  if (req.user.id !== resourceUserId) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      error: ERROR_MESSAGES.FORBIDDEN,
    } as ApiResponse);
    return;
  }

  next();
};