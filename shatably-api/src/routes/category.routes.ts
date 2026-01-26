import { Router } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/categories
 * Get all categories with hierarchy
 */
router.get('/', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null, // Only root categories
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        icon: cat.icon,
        image: cat.image,
        productCount: cat._count.products,
        children: cat.children.map((child) => ({
          id: child.id,
          nameAr: child.nameAr,
          nameEn: child.nameEn,
          slug: child.slug,
          icon: child.icon,
          productCount: child._count.products,
        })),
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/flat
 * Get all categories as flat list
 */
router.get('/flat', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { parentId: 'asc' },
        { sortOrder: 'asc' },
      ],
      include: {
        parent: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        icon: cat.icon,
        parentId: cat.parentId,
        parent: cat.parent,
        productCount: cat._count.products,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/categories/:idOrSlug
 * Get single category with products
 */
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
        isActive: true,
      },
      include: {
        parent: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    res.json({
      success: true,
      data: {
        id: category.id,
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        slug: category.slug,
        icon: category.icon,
        image: category.image,
        parent: category.parent,
        productCount: category._count.products,
        children: category.children.map((child) => ({
          id: child.id,
          nameAr: child.nameAr,
          nameEn: child.nameEn,
          slug: child.slug,
          icon: child.icon,
          productCount: child._count.products,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
