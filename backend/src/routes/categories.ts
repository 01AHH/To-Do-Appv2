import express from 'express';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { authenticate } from '../middleware/auth';
import { 
  ValidationError, 
  NotFoundError,
  ConflictError 
} from '../middleware/errorHandler';
import type { 
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
  ApiResponse
} from '../types/api';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  description: z.string().optional(),
  isFavorite: z.boolean().optional()
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  description: z.string().optional(),
  isFavorite: z.boolean().optional()
});

/**
 * Validate category ownership
 */
const validateCategoryOwnership = async (categoryId: string, userId: string) => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { id: true }
  });
  
  if (!category) {
    throw new NotFoundError('Category not found');
  }
  
  return category;
};

/**
 * Format category response
 */
const formatCategoryResponse = (category: any): CategoryResponse => ({
  id: category.id,
  name: category.name,
  color: category.color,
  description: category.description,
  isFavorite: category.isFavorite,
  userId: category.userId,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
  taskCount: category._count?.tasks || 0
});

/**
 * GET /api/v1/categories
 * Get user's categories
 */
router.get('/', async (req, res, next) => {
  try {
    const { includeCounts = 'false' } = req.query;

    const categories = await prisma.category.findMany({
      where: { userId: req.user!.userId },
      include: {
        _count: includeCounts === 'true' ? {
          select: { tasks: true }
        } : false
      },
      orderBy: [
        { isFavorite: 'desc' },
        { name: 'asc' }
      ]
    });

    const response: ApiResponse<CategoryResponse[]> = {
      success: true,
      data: categories.map(formatCategoryResponse),
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/categories
 * Create a new category
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const validation = createCategorySchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid category data', errors);
    }

    const categoryData: CreateCategoryRequest = validation.data;

    // Check for duplicate category name for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: req.user!.userId,
        name: categoryData.name.trim()
      }
    });

    if (existingCategory) {
      throw new ConflictError('Category with this name already exists');
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: categoryData.name.trim(),
        color: categoryData.color || '#007AFF',
        description: categoryData.description?.trim() || null,
        isFavorite: categoryData.isFavorite || false,
        userId: req.user!.userId
      },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    const response: ApiResponse<CategoryResponse> = {
      success: true,
      data: formatCategoryResponse(category),
      message: 'Category created successfully',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/categories/:id
 * Get a specific category
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id, userId: req.user!.userId },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const response: ApiResponse<CategoryResponse> = {
      success: true,
      data: formatCategoryResponse(category),
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/categories/:id
 * Update a category
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate category ownership
    await validateCategoryOwnership(id, req.user!.userId);

    // Validate request body
    const validation = updateCategorySchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message);
      throw new ValidationError('Invalid category data', errors);
    }

    const updateData: UpdateCategoryRequest = validation.data;

    // Check for duplicate name if name is being updated
    if (updateData.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: req.user!.userId,
          name: updateData.name.trim(),
          id: { not: id }
        }
      });

      if (existingCategory) {
        throw new ConflictError('Category with this name already exists');
      }
    }

    // Prepare update data
    const updatePayload: any = {};
    if (updateData.name) updatePayload.name = updateData.name.trim();
    if (updateData.color) updatePayload.color = updateData.color;
    if (updateData.description !== undefined) updatePayload.description = updateData.description?.trim() || null;
    if (updateData.isFavorite !== undefined) updatePayload.isFavorite = updateData.isFavorite;

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: updatePayload,
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    });

    const response: ApiResponse<CategoryResponse> = {
      success: true,
      data: formatCategoryResponse(category),
      message: 'Category updated successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/categories/:id
 * Delete a category
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate category ownership
    await validateCategoryOwnership(id, req.user!.userId);

    // Check if category has tasks
    const tasksCount = await prisma.task.count({
      where: { categoryId: id }
    });

    if (tasksCount > 0) {
      // Move tasks to no category instead of blocking deletion
      await prisma.task.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      });
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: tasksCount > 0 
        ? `Category deleted successfully. ${tasksCount} tasks moved to no category.`
        : 'Category deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;