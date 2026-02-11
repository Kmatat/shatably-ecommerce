import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import cartController from '../controllers/cart.controller';

const router = Router();

// Validation schemas
const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

const applyPromoSchema = z.object({
  code: z.string().min(1),
});

// All cart routes require authentication
router.use(authenticate);

/**
 * GET /api/cart
 * Get user's cart
 */
router.get('/', cartController.getCart);

/**
 * POST /api/cart/items
 * Add item to cart
 */
router.post('/items', validateBody(addToCartSchema), cartController.addItem);

/**
 * PUT /api/cart/items/:productId
 * Update cart item quantity
 */
router.put('/items/:productId', validateBody(updateCartItemSchema), cartController.updateItem);

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart
 */
router.delete('/items/:productId', cartController.removeItem);

/**
 * DELETE /api/cart
 * Clear cart
 */
router.delete('/', cartController.clearCart);

/**
 * POST /api/cart/promo
 * Apply promo code
 */
router.post('/promo', validateBody(applyPromoSchema), cartController.applyPromo);

/**
 * DELETE /api/cart/promo
 * Remove promo code
 */
router.delete('/promo', cartController.removePromo);

export default router;
