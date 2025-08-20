import express from 'express';
import { z } from 'zod';
import { GoalCategory } from '@prisma/client';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth';
import { 
  ValidationError, 
  NotFoundError 
} from '../middleware/errorHandler';
import type { 
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalResponse,
  ApiResponse,
  GoalStats
} from '../types/api';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().optional(),
  category: z.nativeEnum(GoalCategory).optional(),
  targetDate: z.string().datetime().optional(),
  parentGoalId: z.string().uuid().optional()
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(GoalCategory).optional(),
  targetDate: z.string().datetime().nullable().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  isCompleted: z.boolean().optional()
});

/**
 * Validate goal ownership
 */
const validateGoalOwnership = async (goalId: string, userId: string) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true }
  });
  
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }
  
  return goal;
};

/**
 * Format goal response
 */
const formatGoalResponse = (goal: any): GoalResponse => ({
  id: goal.id,
  title: goal.title,
  description: goal.description,
  category: goal.category,
  targetDate: goal.targetDate?.toISOString() || null,
  progressPercentage: goal.progressPercentage,
  isCompleted: goal.isCompleted,
  userId: goal.userId,
  parentGoalId: goal.parentGoalId,
  createdAt: goal.createdAt.toISOString(),
  updatedAt: goal.updatedAt.toISOString(),
  subgoals: goal.subgoals?.map(formatGoalResponse)
});

/**
 * GET /api/v1/goals
 * Get user's goals
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, isCompleted, parentGoalId } = req.query;

    // Build where clause
    const where: any = {
      userId: req.user!.userId
    };

    if (category) {
      where.category = category;
    }

    if (isCompleted !== undefined) {
      where.isCompleted = isCompleted === 'true';
    }

    if (parentGoalId === 'null') {
      where.parentGoalId = null;
    } else if (parentGoalId) {
      where.parentGoalId = parentGoalId;
    }

    const goals = await prisma.goal.findMany({
      where,
      include: {
        subgoals: {
          include: {
            subgoals: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse<GoalResponse[]> = {
      success: true,
      data: goals.map(formatGoalResponse),
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/goals
 * Create a new goal
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validation = createGoalSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid goal data', errors);
    }

    const goalData: CreateGoalRequest = validation.data;

    // Validate parent goal ownership if provided
    if (goalData.parentGoalId) {
      await validateGoalOwnership(goalData.parentGoalId, req.user!.userId);
    }

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        title: goalData.title,
        description: goalData.description || null,
        category: goalData.category || GoalCategory.OTHER,
        targetDate: goalData.targetDate ? new Date(goalData.targetDate) : null,
        parentGoalId: goalData.parentGoalId || null,
        userId: req.user!.userId
      },
      include: {
        subgoals: {
          include: {
            subgoals: true
          }
        }
      }
    });

    const response: ApiResponse<GoalResponse> = {
      success: true,
      data: formatGoalResponse(goal),
      message: 'Goal created successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/goals/:id
 * Get a specific goal
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: { id, userId: req.user!.userId },
      include: {
        subgoals: {
          include: {
            subgoals: true
          }
        }
      }
    });

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    const response: ApiResponse<GoalResponse> = {
      success: true,
      data: formatGoalResponse(goal),
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/goals/:id
 * Update a goal
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate goal ownership
    await validateGoalOwnership(id, req.user!.userId);

    // Validate request body
    const validation = updateGoalSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid goal data', errors);
    }

    const updateData: UpdateGoalRequest = validation.data;

    // Prepare update data
    const updatePayload: any = { ...updateData };

    // Handle date conversion
    if (updateData.targetDate !== undefined) {
      updatePayload.targetDate = updateData.targetDate ? new Date(updateData.targetDate) : null;
    }

    // Auto-complete if progress reaches 100%
    if (updateData.progressPercentage === 100 && !updateData.isCompleted) {
      updatePayload.isCompleted = true;
    }

    // Update goal
    const goal = await prisma.goal.update({
      where: { id },
      data: updatePayload,
      include: {
        subgoals: {
          include: {
            subgoals: true
          }
        }
      }
    });

    const response: ApiResponse<GoalResponse> = {
      success: true,
      data: formatGoalResponse(goal),
      message: 'Goal updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/goals/:id
 * Delete a goal
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate goal ownership
    await validateGoalOwnership(id, req.user!.userId);

    // Delete goal (cascade will handle subgoals)
    await prisma.goal.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Goal deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/goals/stats
 * Get goal statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user!.userId;

    // Get goal counts
    const totalGoals = await prisma.goal.count({
      where: { userId }
    });

    const completedGoals = await prisma.goal.count({
      where: { userId, isCompleted: true }
    });

    const inProgressGoals = totalGoals - completedGoals;

    // Get average progress
    const progressData = await prisma.goal.aggregate({
      where: { userId, isCompleted: false },
      _avg: { progressPercentage: true }
    });

    const stats: GoalStats = {
      total: totalGoals,
      completed: completedGoals,
      inProgress: inProgressGoals,
      averageProgress: Math.round(progressData._avg.progressPercentage || 0),
      completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
    };

    const response: ApiResponse<GoalStats> = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;