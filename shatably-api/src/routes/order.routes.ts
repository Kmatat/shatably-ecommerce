import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { generateOrderNumber, calculateDiscount, calculateDeliveryFee, paginate, createPaginatedResponse } from '../utils/helpers';
import smsService from '../services/sms.service';

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

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const status = req.query.status as string;
    const { skip } = paginate({ page, limit });

    const where: any = { userId: req.user!.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: { include: { images: { take: 1 } } } } }, address: true },
      }),
      prisma.order.count({ where }),
    ]);

    const transformedOrders = orders.map((order) => ({
      id: order.id, orderNumber: order.orderNumber, status: order.status,
      paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus,
      deliveryType: order.deliveryType, subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee), discount: Number(order.discount),
      total: Number(order.total), itemsCount: order.items.length, createdAt: order.createdAt,
      items: order.items.slice(0, 3).map((item) => ({
        nameAr: item.nameAr, nameEn: item.nameEn, quantity: item.quantity,
        price: Number(item.price), image: item.product.images[0]?.url || null,
      })),
    }));

    res.json({ success: true, ...createPaginatedResponse(transformedOrders, total, page, limit) });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }], userId: req.user!.id },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
        address: true, driver: true, statusHistory: { orderBy: { createdAt: 'asc' } }, payment: true,
      },
    });

    if (!order) throw new AppError('Order not found', 404);

    res.json({
      success: true,
      data: {
        id: order.id, orderNumber: order.orderNumber, status: order.status,
        paymentMethod: order.paymentMethod, paymentStatus: order.paymentStatus,
        deliveryType: order.deliveryType, scheduledDate: order.scheduledDate,
        scheduledTime: order.scheduledTime, subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee), discount: Number(order.discount),
        total: Number(order.total), promoCode: order.promoCode, notes: order.notes,
        createdAt: order.createdAt, deliveredAt: order.deliveredAt,
        address: { label: order.address.label, fullAddress: order.address.fullAddress,
          contactName: order.address.contactName, contactPhone: order.address.contactPhone },
        driver: order.driver ? { name: order.driver.name, phone: order.driver.phone,
          vehicle: order.driver.vehicle, plateNumber: order.driver.plateNumber } : null,
        items: order.items.map((item) => ({
          productId: item.productId, nameAr: item.nameAr, nameEn: item.nameEn, sku: item.sku,
          price: Number(item.price), quantity: item.quantity, total: Number(item.total),
          image: item.product.images[0]?.url || null,
        })),
        statusHistory: order.statusHistory.map((h) => ({ status: h.status, note: h.note, createdAt: h.createdAt })),
      },
    });
  } catch (error) { next(error); }
});

router.post('/', validateBody(createOrderSchema), async (req, res, next) => {
  try {
    const { addressId, deliveryType, scheduledDate, scheduledTime, paymentMethod, notes } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', 400);

    const address = await prisma.address.findFirst({ where: { id: addressId, userId: req.user!.id } });
    if (!address) throw new AppError('Address not found', 404);

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) throw new AppError(`Insufficient stock for ${item.product.nameEn}`, 400);
      const price = Number(item.product.price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      orderItems.push({ productId: item.productId, nameAr: item.product.nameAr, nameEn: item.product.nameEn,
        sku: item.product.sku, price, quantity: item.quantity, total: itemTotal });
    }

    const settings = { expressBaseFee: 150, scheduledBaseFee: 100, freeDeliveryThreshold: 5000 };
    const deliveryFee = calculateDeliveryFee(subtotal, deliveryType, settings);

    let discount = 0;
    if (cart.promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: { code: cart.promoCode, isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
      });
      if (promo) {
        discount = calculateDiscount(subtotal, { type: promo.type, value: Number(promo.value),
          minOrderAmount: promo.minOrderAmount, maxDiscount: promo.maxDiscount });
        await prisma.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const total = subtotal + deliveryFee - discount;
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber, userId: req.user!.id, addressId, status: 'pending',
          paymentMethod, paymentStatus: 'pending', deliveryType,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null, scheduledTime,
          subtotal, deliveryFee, discount, total, promoCode: cart.promoCode, notes,
          items: { create: orderItems },
          statusHistory: { create: { status: 'pending', note: 'Order placed' } },
        },
      });

      if (paymentMethod !== 'cod') {
        await tx.payment.create({
          data: { orderId: newOrder.id, method: paymentMethod, status: 'pending', amount: total },
        });
      }

      for (const item of cart.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { promoCode: null } });

      return newOrder;
    });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (user) await smsService.sendOrderConfirmation(user.phone, orderNumber);

    res.status(201).json({ success: true, message: 'Order placed successfully', data: { id: order.id, orderNumber: order.orderNumber, total: Number(order.total) } });
  } catch (error) { next(error); }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }], userId: req.user!.id },
      include: { items: true },
    });

    if (!order) throw new AppError('Order not found', 404);
    if (!['pending', 'confirmed'].includes(order.status)) throw new AppError('Cannot cancel this order', 400);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: 'cancelled', cancelReason: reason } });
      await tx.orderStatusHistory.create({ data: { orderId: order.id, status: 'cancelled', note: reason, createdBy: req.user!.id } });
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    });

    res.json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) { next(error); }
});

export default router;
