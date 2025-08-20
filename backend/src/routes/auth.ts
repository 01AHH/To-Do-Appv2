import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { 
  hashPassword, 
  comparePassword, 
  generateTokenPair, 
  verifyRefreshToken,
  validatePassword,
  validateEmail
} from '../utils/auth';
import { authenticate } from '../middleware/auth';
import { 
  ValidationError, 
  AuthenticationError, 
  ConflictError 
} from '../middleware/errorHandler';
import type { 
  RegisterRequest, 
  LoginRequest, 
  RefreshTokenRequest,
  AuthResponse,
  ApiResponse 
} from '../types/api';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid registration data', errors);
    }

    const { email, password, name }: RegisterRequest = validation.data;

    // Additional email validation
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError('Password does not meet requirements', passwordValidation.errors);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name?.trim() || null,
        lastActive: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true
      }
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    });

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString()
        },
        tokens
      },
      message: 'User registered successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid login data', errors);
    }

    const { email, password }: LoginRequest = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        passwordHash: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          createdAt: user.createdAt.toISOString()
        },
        tokens
      },
      message: 'Login successful',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    // Validate request body
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid refresh token data', errors);
    }

    const { refreshToken }: RefreshTokenRequest = validation.data;

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email
    });

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString()
        },
        tokens
      },
      message: 'Token refreshed successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true
      }
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const response: ApiResponse = {
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastActive: user.lastActive?.toISOString() || null
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      avatarUrl: z.string().url().optional(),
      preferences: z.record(z.any()).optional()
    });

    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid profile data', errors);
    }

    const updateData = validation.data;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        emailVerified: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        lastActive: user.lastActive?.toISOString() || null
      },
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;