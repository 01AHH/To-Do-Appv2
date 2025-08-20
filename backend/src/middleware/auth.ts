import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/auth';
import { AuthenticationError } from './errorHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const payload = verifyAccessToken(token);
    
    // Add user info to request object
    req.user = {
      userId: payload.userId,
      email: payload.email
    };

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new AuthenticationError(error.message));
    } else {
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email
      };
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};