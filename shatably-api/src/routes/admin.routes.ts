import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { paginate, createPaginatedResponse, slugify, generateSku } from '../utils/helpers';
import smsService from '../services/sms.service';

const router = Router();
router.use(authenticate, requireAdmin);

// ============ DASHBOARD ============
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, todayRevenue, totalCustomers, pendingLists, lowStockProducts, recentOrders] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: today }, status: { not: 'cancelled' } }, _sum: { total: true } }),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.materialList.count({ where: { status: 'pending' } }),
      prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true } } } }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          todayOrders, todayRevenue: Number(todayRevenue._sum.total || 0),
          totalCustomers, pendingLists, lowStockProducts,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o.id, orderNumber: o.orderNumber, customer: o.user.name || o.user.phone,
          total: Number(o.total), status: o.status, createdAt: o.createdAt,
        })),
      },
    });
  } catch (error) { next(error); }
});

// ============ ORDERS ============
router.get('/orders', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const status = req.query.status as string;
    const search = req.query.search as string;
    const { skip } = paginate({ page, limit });

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (search) where.OR = [{ orderNumber: { contains: search } }, { user: { phone: { contains: search } } }];

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true } }, address: true, _count: { select: { items: true } } } }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      ...createPaginatedResponse(orders.map((o) => ({
        id: o.id, orderNumber: o.orderNumber, customer: { name: o.user.name, phone: o.user.phone },
        total: Number(o.total), itemsCount: o._count.items, status: o.status,
        paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
        deliveryType: o.deliveryType, createdAt: o.createdAt,
      })), total, page, limit),
    });
  } catch (error) { next(error); }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, driverId } = req.body;

    const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
    if (!order) throw new AppError('Order not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status, ...(driverId && { driverId }),
        ...(status === 'delivered' && { deliveredAt: new Date() }) } });
      await tx.orderStatusHistory.create({ data: { orderId: id, status, note, createdBy: req.user!.id } });
    });

    if (status === 'in_transit') await smsService.sendOrderShipped(order.user.phone, order.orderNumber);
    if (status === 'delivered') await smsService.sendOrderDelivered(order.user.phone, order.orderNumber);

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) { next(error); }
});

// ============ PRODUCTS ============
const productSchema = z.object({
  nameAr: z.string().min(2), nameEn: z.string().min(2),
  descriptionAr: z.string().optional(), descriptionEn: z.string().optional(),
  price: z.number().positive(), originalPrice: z.number().positive().optional(),
  unit: z.enum(['piece', 'bag', 'ton', 'meter', 'sqmeter', 'cubicmeter', 'kg', 'liter', 'box', 'roll']),
  stock: z.number().int().min(0), minOrderQty: z.number().int().positive().default(1),
  maxOrderQty: z.number().int().positive().optional(), weight: z.number().positive().optional(),
  categoryId: z.string().uuid(), brandId: z.string().uuid().optional(),
  specifications: z.record(z.string()).optional(), isFeatured: z.boolean().optional(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string().optional(), isPrimary: z.boolean().optional() })).optional(),
});

router.get('/products', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const { skip } = paginate({ page, limit });

    const [products, total] = await Promise.all([
      prisma.product.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { category: { select: { nameAr: true, nameEn: true } }, images: { take: 1 } } }),
      prisma.product.count(),
    ]);

    res.json({ success: true, ...createPaginatedResponse(products.map((p) => ({
      id: p.id, sku: p.sku, nameAr: p.nameAr, nameEn: p.nameEn, price: Number(p.price),
      stock: p.stock, category: p.category, image: p.images[0]?.url, isActive: p.isActive, isFeatured: p.isFeatured,
    })), total, page, limit) });
  } catch (error) { next(error); }
});

router.post('/products', validateBody(productSchema), async (req, res, next) => {
  try {
    const { images, ...data } = req.body;
    const sku = generateSku(data.categoryId.slice(0, 3));

    const product = await prisma.product.create({
      data: { ...data, sku, isActive: true,
        ...(images && { images: { create: images.map((img: any, i: number) => ({ ...img, sortOrder: i })) } }) },
      include: { images: true },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) { next(error); }
});

router.put('/products/:id', validateBody(productSchema.partial()), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images, ...data } = req.body;

    const product = await prisma.product.update({ where: { id }, data });
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (error) { next(error); }
});

// ============ MATERIAL LISTS ============
router.get('/material-lists', async (req, res, next) => {
  try {
    const status = req.query.status as string;
    const where: any = {};
    if (status && status !== 'all') where.status = status;

    const lists = await prisma.materialList.findMany({ where, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, phone: true } } } });

    res.json({ success: true, data: lists.map((l) => ({
      id: l.id, customer: { name: l.user.name, phone: l.user.phone }, fileName: l.fileName,
      fileUrl: l.fileUrl, fileType: l.fileType, notes: l.notes, status: l.status,
      assignedTo: l.assignedTo, createdAt: l.createdAt, processedAt: l.processedAt,
    })) });
  } catch (error) { next(error); }
});

router.patch('/material-lists/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const list = await prisma.materialList.update({ where: { id },
      data: { status, assignedTo, ...(status === 'ready' && { processedAt: new Date() }) },
      include: { user: true } });

    if (status === 'ready') await smsService.sendMaterialListReady(list.user.phone);

    res.json({ success: true, message: 'Material list updated' });
  } catch (error) { next(error); }
});

// ============ CATEGORIES ============
const categorySchema = z.object({
  nameAr: z.string().min(2), nameEn: z.string().min(2),
  icon: z.string().optional(), image: z.string().url().optional(),
  parentId: z.string().uuid().optional(), sortOrder: z.number().int().optional(),
});

router.post('/categories', validateBody(categorySchema), async (req, res, next) => {
  try {
    const slug = slugify(req.body.nameEn);
    const category = await prisma.category.create({ data: { ...req.body, slug, isActive: true } });
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
});

router.put('/categories/:id', validateBody(categorySchema.partial()), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data: any = { ...req.body };
    if (req.body.nameEn) data.slug = slugify(req.body.nameEn);
    const category = await prisma.category.update({ where: { id }, data });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'Category deactivated' });
  } catch (error) { next(error); }
});

// ============ PROMO CODES ============
const promoSchema = z.object({
  code: z.string().min(3).max(20).transform((v) => v.toUpperCase()),
  type: z.enum(['percentage', 'fixed']), value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(), maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startDate: z.string().transform((v) => new Date(v)), endDate: z.string().transform((v) => new Date(v)),
});

router.get('/promo-codes', async (req, res, next) => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: promos });
  } catch (error) { next(error); }
});

router.post('/promo-codes', validateBody(promoSchema), async (req, res, next) => {
  try {
    const promo = await prisma.promoCode.create({ data: { ...req.body, isActive: true } });
    res.status(201).json({ success: true, data: promo });
  } catch (error) { next(error); }
});

router.delete('/promo-codes/:id', async (req, res, next) => {
  try {
    await prisma.promoCode.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Promo code deactivated' });
  } catch (error) { next(error); }
});

export default router;
