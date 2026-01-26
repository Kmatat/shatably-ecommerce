import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { calculateDiscount, calculateDeliveryFee } from '../utils/helpers';

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
router.get('/', async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Create cart if doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    }

    // Calculate totals
    let subtotal = 0;
    const items = cart.items.map((item) => {
      const unitPrice = Number(item.product.price);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        total: itemTotal,
        product: {
          id: item.product.id,
          sku: item.product.sku,
          nameAr: item.product.nameAr,
          nameEn: item.product.nameEn,
          price: unitPrice,
          originalPrice: item.product.originalPrice ? Number(item.product.originalPrice) : null,
          unit: item.product.unit,
          stock: item.product.stock,
          image: item.product.images[0]?.url || null,
        },
      };
    });

    // Calculate promo discount
    let discount = 0;
    let promoDetails = null;

    if (cart.promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: {
          code: cart.promoCode,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (promo) {
        discount = calculateDiscount(subtotal, {
          type: promo.type,
          value: Number(promo.value),
          minOrderAmount: promo.minOrderAmount ? Number(promo.minOrderAmount) : null,
          maxDiscount: promo.maxDiscount ? Number(promo.maxDiscount) : null,
        });
        promoDetails = {
          code: promo.code,
          type: promo.type,
          value: Number(promo.value),
          discount,
        };
      }
    }

    // Calculate delivery fees for reference
    const settings = {
      expressBaseFee: 150,
      scheduledBaseFee: 100,
      freeDeliveryThreshold: 5000,
    };

    const expressDeliveryFee = calculateDeliveryFee(subtotal, 'express', settings);
    const scheduledDeliveryFee = calculateDeliveryFee(subtotal, 'scheduled', settings);

    res.json({
      success: true,
      data: {
        id: cart.id,
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        discount,
        promo: promoDetails,
        delivery: {
          express: expressDeliveryFee,
          scheduled: scheduledDeliveryFee,
          freeThreshold: settings.freeDeliveryThreshold,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cart/items
 * Add item to cart
 */
router.post('/items', validateBody(addToCartSchema), async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Check product exists and is active
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check stock
    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items available`, 400);
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        throw new AppError(`Only ${product.stock} items available`, 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        itemCount: updatedCart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/cart/items/:productId
 * Update cart item quantity
 */
router.put('/items/:productId', validateBody(updateCartItemSchema), async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      include: { product: true },
    });

    if (!cartItem) {
      throw new AppError('Item not in cart', 404);
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      throw new AppError(`Only ${cartItem.product.stock} items available`, 400);
    }

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    res.json({
      success: true,
      message: 'Cart updated',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart
 */
router.delete('/items/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart
 * Clear cart
 */
router.delete('/', async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await prisma.cart.update({
        where: { id: cart.id },
        data: { promoCode: null },
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cart/promo
 * Apply promo code
 */
router.post('/promo', validateBody(applyPromoSchema), async (req, res, next) => {
  try {
    const { code } = req.body;

    // Find valid promo
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [
          { usageLimit: null },
          { usedCount: { lt: prisma.promoCode.fields.usageLimit } },
        ],
      },
    });

    if (!promo) {
      throw new AppError('Invalid or expired promo code', 400);
    }

    // Update cart with promo code
    await prisma.cart.update({
      where: { userId: req.user!.id },
      data: { promoCode: promo.code },
    });

    res.json({
      success: true,
      message: 'Promo code applied',
      data: {
        code: promo.code,
        type: promo.type,
        value: Number(promo.value),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart/promo
 * Remove promo code
 */
router.delete('/promo', async (req, res, next) => {
  try {
    await prisma.cart.update({
      where: { userId: req.user!.id },
      data: { promoCode: null },
    });

    res.json({
      success: true,
      message: 'Promo code removed',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
