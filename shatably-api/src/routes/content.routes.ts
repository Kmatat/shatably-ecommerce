import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/content
 * Get content by type
 */
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;

    const where: any = {
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    const content = await prisma.content.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/:key
 * Get content by key
 */
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    const content = await prisma.content.findUnique({
      where: { key },
    });

    if (!content || !content.isActive) {
      throw new AppError('Content not found', 404);
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/page/:pageType
 * Get all content sections for a specific page type
 */
router.get('/page/:pageType', async (req, res, next) => {
  try {
    const { pageType } = req.params;

    const content = await prisma.content.findMany({
      where: {
        type: pageType as any,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
