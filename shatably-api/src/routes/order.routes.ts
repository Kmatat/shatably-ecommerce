import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import orderController from '../controllers/order.controller';

const router = Router();

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  deliveryType: z.enum(['express', 'scheduled']),
  scheduledDate: z.string().optional(),
  scheduledTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  paymentMethod: z.enum(['cod', 'card', 'fawry', 'wallet']),
  notes: z.string().optional(),
});

router.use(authenticate);

/**
 * GET /api/orders
 * List user orders
 */
router.get('/', orderController.findAll);

/**
 * GET /api/orders/:id
 * Get order details
 */
router.get('/:id', orderController.findById);

/**
 * POST /api/orders
 * Create new order
 */
router.post('/', validateBody(createOrderSchema), orderController.createOrder);

/**
 * POST /api/orders/:id/cancel
 * Cancel order
 */
router.post('/:id/cancel', orderController.cancelOrder);

export default router;
