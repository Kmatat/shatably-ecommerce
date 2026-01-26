import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

/**
 * GET /api/brands
 * Get all active brands
 */
router.get('/', async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
    });

    res.json({
      success: true,
      data: brands.map((brand) => ({
        id: brand.id,
        nameAr: brand.nameAr,
        nameEn: brand.nameEn,
        slug: brand.slug,
        logo: brand.logo,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
