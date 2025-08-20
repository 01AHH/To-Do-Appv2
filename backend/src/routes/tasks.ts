import express from 'express';
import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth';
import { 
  ValidationError, 
  NotFoundError,
  AuthorizationError 
} from '../middleware/errorHandler';
import type { 
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
  TaskResponse,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  TaskStats
} from '../types/api';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional(),
  backburnerDate: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  parentTaskId: z.string().uuid().optional(),
  estimatedHours: z.number().min(0).max(999.99).optional()
}).refine((data) => {
  // Backburner validation: if status is BACKBURNER, either dueDate or backburnerDate must be provided
  if (data.status === TaskStatus.BACKBURNER) {
    return data.dueDate || data.backburnerDate;
  }
  return true;
}, {
  message: 'Backburner tasks must have either a due date or backburner date assigned',
  path: ['backburnerDate']
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  backburnerDate: z.string().datetime().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
  estimatedHours: z.number().min(0).max(999.99).nullable().optional(),
  actualHours: z.number().min(0).max(999.99).nullable().optional(),
  position: z.number().int().optional()
}).refine((data) => {
  // Backburner validation for updates
  if (data.status === TaskStatus.BACKBURNER) {
    return data.dueDate || data.backburnerDate;
  }
  return true;
}, {
  message: 'Backburner tasks must have either a due date or backburner date assigned',
  path: ['backburnerDate']
});

/**
 * Validate task ownership
 */
const validateTaskOwnership = async (taskId: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true }
  });
  
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  
  return task;
};

/**
 * Format task response
 */
const formatTaskResponse = (task: any): TaskResponse => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate?.toISOString() || null,
  backburnerDate: task.backburnerDate?.toISOString() || null,
  completedAt: task.completedAt?.toISOString() || null,
  position: task.position,
  estimatedHours: task.estimatedHours ? parseFloat(task.estimatedHours.toString()) : null,
  actualHours: task.actualHours ? parseFloat(task.actualHours.toString()) : null,
  tags: task.tags,
  userId: task.userId,
  categoryId: task.categoryId,
  parentTaskId: task.parentTaskId,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
  category: task.category ? {
    id: task.category.id,
    name: task.category.name,
    color: task.category.color,
    description: task.category.description,
    isFavorite: task.category.isFavorite,
    userId: task.category.userId,
    createdAt: task.category.createdAt.toISOString(),
    updatedAt: task.category.updatedAt.toISOString()
  } : undefined,
  subtasks: task.subtasks?.map(formatTaskResponse)
});

/**
 * GET /api/v1/tasks
 * Get user's tasks with filtering and pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      categoryId,
      search,
      dueDate,
      tags,
      parentTaskId
    } = req.query;

    // Build where clause
    const where: any = {
      userId: req.user!.userId
    };

    // Apply filters
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (priority) {
      if (Array.isArray(priority)) {
        where.priority = { in: priority };
      } else {
        where.priority = priority;
      }
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (dueDate) {
      const date = new Date(dueDate as string);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.dueDate = {
        gte: date,
        lt: nextDay
      };
    }

    if (tags && Array.isArray(tags)) {
      where.tags = {
        hasEvery: tags
      };
    }

    if (parentTaskId === 'null') {
      where.parentTaskId = null;
    } else if (parentTaskId) {
      where.parentTaskId = parentTaskId;
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await prisma.task.count({ where });

    // Get tasks
    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
        subtasks: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder
      },
      skip,
      take: limitNum
    });

    const totalPages = Math.ceil(total / limitNum);

    const response: ApiResponse<PaginatedResponse<TaskResponse>> = {
      success: true,
      data: {
        data: tasks.map(formatTaskResponse),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/tasks
 * Create a new task
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => 
        err.path.length > 0 ? `${err.path.join('.')}: ${err.message}` : err.message
      );
      throw new ValidationError('Invalid task data', errors);
    }

    const taskData: CreateTaskRequest = validation.data;

    // Validate category ownership if provided
    if (taskData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: taskData.categoryId, userId: req.user!.userId },
        select: { id: true }
      });
      
      if (!category) {
        throw new ValidationError('Invalid category');
      }
    }

    // Validate parent task ownership if provided
    if (taskData.parentTaskId) {
      await validateTaskOwnership(taskData.parentTaskId, req.user!.userId);
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.status || TaskStatus.PENDING,
        priority: taskData.priority || Priority.MEDIUM,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        backburnerDate: taskData.backburnerDate ? new Date(taskData.backburnerDate) : null,
        categoryId: taskData.categoryId || null,
        tags: taskData.tags || [],
        parentTaskId: taskData.parentTaskId || null,
        estimatedHours: taskData.estimatedHours || null,
        userId: req.user!.userId,
        completedAt: taskData.status === TaskStatus.COMPLETED ? new Date() : null
      },
      include: {
        category: true,
        subtasks: {
          include: {
            category: true
          }
        }
      }
    });

    const response: ApiResponse<TaskResponse> = {
      success: true,
      data: formatTaskResponse(task),
      message: 'Task created successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tasks/:id
 * Get a specific task
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId: req.user!.userId },
      include: {
        category: true,
        subtasks: {
          include: {
            category: true
          }
        }
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const response: ApiResponse<TaskResponse> = {
      success: true,
      data: formatTaskResponse(task),
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/tasks/:id
 * Update a task
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate task ownership
    await validateTaskOwnership(id, req.user!.userId);

    // Validate request body
    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => 
        err.path.length > 0 ? `${err.path.join('.')}: ${err.message}` : err.message
      );
      throw new ValidationError('Invalid task data', errors);
    }

    const updateData: UpdateTaskRequest = validation.data;

    // Additional validation for status change to BACKBURNER
    if (updateData.status === TaskStatus.BACKBURNER) {
      // Get current task to check existing dates
      const currentTask = await prisma.task.findUnique({
        where: { id },
        select: { dueDate: true, backburnerDate: true }
      });

      if (!currentTask) {
        throw new NotFoundError('Task not found');
      }

      // Check if the update provides a date or if one already exists
      const willHaveDueDate = updateData.dueDate !== undefined ? updateData.dueDate : currentTask.dueDate;
      const willHaveBackburnerDate = updateData.backburnerDate !== undefined ? updateData.backburnerDate : currentTask.backburnerDate;

      if (!willHaveDueDate && !willHaveBackburnerDate) {
        throw new ValidationError('Backburner tasks must have either a due date or backburner date assigned');
      }
    }

    // Validate category ownership if provided
    if (updateData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: updateData.categoryId, userId: req.user!.userId },
        select: { id: true }
      });
      
      if (!category) {
        throw new ValidationError('Invalid category');
      }
    }

    // Prepare update data
    const updatePayload: any = { ...updateData };

    // Handle date conversions
    if (updateData.dueDate !== undefined) {
      updatePayload.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }
    if (updateData.backburnerDate !== undefined) {
      updatePayload.backburnerDate = updateData.backburnerDate ? new Date(updateData.backburnerDate) : null;
    }

    // Set completed timestamp if status changes to COMPLETED
    if (updateData.status === TaskStatus.COMPLETED) {
      updatePayload.completedAt = new Date();
    } else if (updateData.status && updateData.status !== TaskStatus.COMPLETED) {
      updatePayload.completedAt = null;
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: updatePayload,
      include: {
        category: true,
        subtasks: {
          include: {
            category: true
          }
        }
      }
    });

    const response: ApiResponse<TaskResponse> = {
      success: true,
      data: formatTaskResponse(task),
      message: 'Task updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate task ownership
    await validateTaskOwnership(id, req.user!.userId);

    // Delete task (cascade will handle subtasks)
    await prisma.task.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tasks/stats
 * Get task statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const now = new Date();

    // Get task counts by status
    const taskCounts = await prisma.task.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true }
    });

    // Get overdue tasks count
    const overdueCount = await prisma.task.count({
      where: {
        userId,
        dueDate: { lt: now },
        status: { not: TaskStatus.COMPLETED }
      }
    });

    // Calculate stats
    const total = taskCounts.reduce((sum, group) => sum + group._count.status, 0);
    const completed = taskCounts.find(g => g.status === TaskStatus.COMPLETED)?._count.status || 0;
    const pending = taskCounts.find(g => g.status === TaskStatus.PENDING)?._count.status || 0;
    const inProgress = taskCounts.find(g => g.status === TaskStatus.IN_PROGRESS)?._count.status || 0;
    const backburner = taskCounts.find(g => g.status === TaskStatus.BACKBURNER)?._count.status || 0;

    const stats: TaskStats = {
      total,
      pending,
      inProgress,
      completed,
      backburner,
      overdue: overdueCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };

    const response: ApiResponse<TaskStats> = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/tasks/completed/bulk
 * Bulk delete completed tasks
 */
router.delete('/completed/bulk', async (req, res, next) => {
  try {
    const result = await prisma.task.deleteMany({
      where: {
        userId: req.user!.userId,
        status: TaskStatus.COMPLETED
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `${result.count} completed tasks deleted`,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;