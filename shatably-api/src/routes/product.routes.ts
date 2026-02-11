import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import productController from '../controllers/product.controller';

const router = Router();

// Query validation
const productsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.string().optional(),
  brand: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'rating']).optional().default('newest'),
});

/**
 * GET /api/products
 * List products with filters and pagination
 */
router.get('/', validateQuery(productsQuerySchema), productController.findAll);

/**
 * GET /api/products/featured
 * Get featured products
 */
router.get('/featured', productController.findFeatured);

/**
 * GET /api/products/deals
 * Get products on sale
 */
router.get('/deals', productController.findDeals);

/**
 * GET /api/products/search/:query
 * Search products
 */
router.get('/search/:query', productController.search);

/**
 * GET /api/products/brands
 * Get all brands
 */
router.get('/brands', productController.getBrands);

/**
 * GET /api/products/:id
 * Get single product details
 */
router.get('/:id', optionalAuth, productController.findById);

export default router;
