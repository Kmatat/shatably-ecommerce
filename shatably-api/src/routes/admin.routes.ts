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
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const stockFilter = req.query.stock as string;
    const { skip } = paginate({ page, limit });

    const where: any = {};
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId && categoryId !== 'all') where.categoryId = categoryId;
    if (stockFilter === 'in_stock') where.stock = { gt: 10 };
    else if (stockFilter === 'low_stock') where.stock = { gt: 0, lte: 10 };
    else if (stockFilter === 'out_of_stock') where.stock = 0;

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, nameAr: true, nameEn: true } }, brand: { select: { id: true, nameAr: true, nameEn: true } }, images: true } }),
      prisma.product.count({ where }),
    ]);

    res.json({ success: true, ...createPaginatedResponse(products.map((p) => ({
      id: p.id, sku: p.sku, nameAr: p.nameAr, nameEn: p.nameEn, descriptionAr: p.descriptionAr, descriptionEn: p.descriptionEn,
      price: Number(p.price), originalPrice: p.originalPrice ? Number(p.originalPrice) : null, unit: p.unit,
      stock: p.stock, minOrderQty: p.minOrderQty, maxOrderQty: p.maxOrderQty, weight: p.weight ? Number(p.weight) : null,
      category: p.category, brand: p.brand, images: p.images.map(img => img.url), isActive: p.isActive, isFeatured: p.isFeatured,
      specifications: p.specifications, createdAt: p.createdAt,
    })), total, page, limit) });
  } catch (error) { next(error); }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id },
      include: { category: { select: { id: true, nameAr: true, nameEn: true } }, brand: { select: { id: true, nameAr: true, nameEn: true } }, images: true } });
    if (!product) throw new AppError('Product not found', 404);

    res.json({ success: true, data: {
      id: product.id, sku: product.sku, nameAr: product.nameAr, nameEn: product.nameEn,
      descriptionAr: product.descriptionAr, descriptionEn: product.descriptionEn,
      price: Number(product.price), originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      unit: product.unit, stock: product.stock, minOrderQty: product.minOrderQty, maxOrderQty: product.maxOrderQty,
      weight: product.weight ? Number(product.weight) : null, categoryId: product.categoryId, brandId: product.brandId,
      category: product.category, brand: product.brand, images: product.images.map(img => ({ id: img.id, url: img.url, alt: img.alt, isPrimary: img.isPrimary })),
      isActive: product.isActive, isFeatured: product.isFeatured, specifications: product.specifications, createdAt: product.createdAt,
    } });
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

    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({ data: images.map((img: any, i: number) => ({ productId: id, url: img.url, alt: img.alt || '', isPrimary: i === 0, sortOrder: i })) });
      }
    });

    const product = await prisma.product.findUnique({ where: { id }, include: { images: true, category: true, brand: true } });
    res.json({ success: true, data: product });
  } catch (error) { next(error); }
});

router.patch('/products/:id/toggle', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Product not found', 404);

    const updated = await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
    res.json({ success: true, data: { isActive: updated.isActive } });
  } catch (error) { next(error); }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) { next(error); }
});

// ============ BRANDS ============
router.get('/brands', async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { nameEn: 'asc' } });
    res.json({ success: true, data: brands.map((b) => ({ id: b.id, nameAr: b.nameAr, nameEn: b.nameEn, logo: b.logo })) });
  } catch (error) { next(error); }
});

router.post('/brands', async (req, res, next) => {
  try {
    const { nameAr, nameEn, logo } = req.body;
    const slug = slugify(nameEn);
    const brand = await prisma.brand.create({ data: { nameAr, nameEn, slug, logo } });
    res.status(201).json({ success: true, data: brand });
  } catch (error) { next(error); }
});

router.put('/brands/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, logo } = req.body;
    const brand = await prisma.brand.update({ where: { id }, data: { nameAr, nameEn, logo } });
    res.json({ success: true, data: brand });
  } catch (error) { next(error); }
});

router.delete('/brands/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { id } });
    res.json({ success: true, message: 'Brand deleted' });
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

// ============ CONTENT MANAGEMENT ============
const contentSchema = z.object({
  type: z.enum(['banner', 'page', 'announcement', 'faq', 'about', 'terms', 'privacy']),
  key: z.string().min(2),
  titleAr: z.string().optional(),
  titleEn: z.string().optional(),
  contentAr: z.string().optional(),
  contentEn: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional().nullable().transform((v) => v ? new Date(v) : null),
  endDate: z.string().optional().nullable().transform((v) => v ? new Date(v) : null),
  metadata: z.record(z.any()).optional(),
});

router.get('/content', async (req, res, next) => {
  try {
    const type = req.query.type as string;
    const where: any = {};
    if (type && type !== 'all') where.type = type;

    const content = await prisma.content.findMany({
      where,
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });

    res.json({ success: true, data: content });
  } catch (error) { next(error); }
});

router.get('/content/:id', async (req, res, next) => {
  try {
    const content = await prisma.content.findUnique({ where: { id: req.params.id } });
    if (!content) throw new AppError('Content not found', 404);
    res.json({ success: true, data: content });
  } catch (error) { next(error); }
});

router.post('/content', validateBody(contentSchema), async (req, res, next) => {
  try {
    const content = await prisma.content.create({ data: req.body });
    res.status(201).json({ success: true, data: content });
  } catch (error) { next(error); }
});

router.put('/content/:id', validateBody(contentSchema.partial()), async (req, res, next) => {
  try {
    const content = await prisma.content.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: content });
  } catch (error) { next(error); }
});

router.delete('/content/:id', async (req, res, next) => {
  try {
    await prisma.content.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Content deleted' });
  } catch (error) { next(error); }
});

// ============ ADMIN USERS MANAGEMENT ============
const adminUserSchema = z.object({
  phone: z.string().min(10),
  name: z.string().min(2),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'employee', 'super_admin']),
  permissions: z.array(z.enum([
    'manage_products', 'manage_categories', 'manage_orders', 'manage_customers',
    'manage_content', 'manage_drivers', 'manage_promos', 'manage_settings',
    'manage_admins', 'view_reports',
  ])).optional(),
  isActive: z.boolean().optional(),
});

router.get('/users', async (req, res, next) => {
  try {
    const role = req.query.role as string;
    const where: any = { role: { in: ['admin', 'employee', 'super_admin'] } };
    if (role && role !== 'all') where.role = role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, phone: true, name: true, email: true, role: true,
        permissions: true, isActive: true, createdAt: true,
      },
    });

    res.json({ success: true, data: users });
  } catch (error) { next(error); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, phone: true, name: true, email: true, role: true,
        permissions: true, isActive: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.post('/users', validateBody(adminUserSchema), async (req, res, next) => {
  try {
    const existingUser = await prisma.user.findUnique({ where: { phone: req.body.phone } });
    if (existingUser) throw new AppError('User with this phone already exists', 400);

    const user = await prisma.user.create({
      data: {
        ...req.body,
        isActive: true,
      },
      select: {
        id: true, phone: true, name: true, email: true, role: true,
        permissions: true, isActive: true, createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.put('/users/:id', validateBody(adminUserSchema.partial()), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
      select: {
        id: true, phone: true, name: true, email: true, role: true,
        permissions: true, isActive: true, createdAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError('User not found', 404);
    if (user.role === 'super_admin') throw new AppError('Cannot delete super admin', 400);

    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) { next(error); }
});

// ============ CUSTOMERS MANAGEMENT ============
router.get('/customers', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const search = req.query.search as string;
    const type = req.query.type as string;
    const { skip } = paginate({ page, limit });

    const where: any = { role: 'customer' };
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }];
    if (type && type !== 'all') where.type = type;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        select: {
          id: true, phone: true, name: true, email: true, type: true,
          isActive: true, createdAt: true,
          orders: {
            select: { total: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      ...createPaginatedResponse(customers.map((c) => {
        const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.total), 0);
        const lastOrderAt = c.orders.length > 0 ? c.orders[0].createdAt : null;
        return {
          id: c.id, phone: c.phone, name: c.name, email: c.email, type: c.type,
          isActive: c.isActive, createdAt: c.createdAt, ordersCount: c.orders.length,
          totalSpent, lastOrderAt,
        };
      }), total, page, limit),
    });
  } catch (error) { next(error); }
});

// ============ DRIVERS MANAGEMENT ============
const driverSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  vehicle: z.string().optional(),
  plateNumber: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/drivers', async (req, res, next) => {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });

    res.json({
      success: true,
      data: drivers.map((d) => ({
        id: d.id, name: d.name, phone: d.phone, email: d.email,
        vehicle: d.vehicle, plateNumber: d.plateNumber,
        isActive: d.isActive, ordersCount: d._count.orders, createdAt: d.createdAt,
      })),
    });
  } catch (error) { next(error); }
});

router.post('/drivers', validateBody(driverSchema), async (req, res, next) => {
  try {
    const driver = await prisma.driver.create({ data: { ...req.body, isActive: true } });
    res.status(201).json({ success: true, data: driver });
  } catch (error) { next(error); }
});

router.put('/drivers/:id', validateBody(driverSchema.partial()), async (req, res, next) => {
  try {
    const driver = await prisma.driver.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: driver });
  } catch (error) { next(error); }
});

router.delete('/drivers/:id', async (req, res, next) => {
  try {
    await prisma.driver.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Driver deactivated' });
  } catch (error) { next(error); }
});

// ============ REPORTS ============
router.get('/reports', async (req, res, next) => {
  try {
    const range = req.query.range as string || 'week';
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case 'today': startDate.setHours(0, 0, 0, 0); break;
      case 'week': startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
    }

    const [revenue, orders, customers, products, topProducts, recentOrders, salesByCategory] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: startDate }, status: { not: 'cancelled' } }, _sum: { total: true } }),
      prisma.order.count({ where: { createdAt: { gte: startDate } } }),
      prisma.user.count({ where: { role: 'customer', createdAt: { gte: startDate } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.orderItem.groupBy({
        by: ['productId'], where: { order: { createdAt: { gte: startDate }, status: { not: 'cancelled' } } },
        _sum: { quantity: true, total: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } }, take: 10, orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true } } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startDate }, status: { not: 'cancelled' } },
        include: { items: { include: { product: { include: { category: true } } } } },
      }),
    ]);

    const productIds = topProducts.map((p) => p.productId);
    const productsData = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(productsData.map((p) => [p.id, p]));

    const categoryStats: Record<string, { sales: number; count: number }> = {};
    let totalSales = 0;
    salesByCategory.forEach((order) => {
      order.items.forEach((item) => {
        const catName = item.product.category.nameEn;
        if (!categoryStats[catName]) categoryStats[catName] = { sales: 0, count: 0 };
        categoryStats[catName].sales += Number(item.total);
        categoryStats[catName].count += item.quantity;
        totalSales += Number(item.total);
      });
    });

    res.json({
      success: true,
      data: {
        totalRevenue: Number(revenue._sum.total || 0),
        totalOrders: orders,
        totalCustomers: customers,
        totalProducts: products,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        topProducts: topProducts.map((p) => {
          const product = productMap.get(p.productId);
          return {
            id: p.productId,
            name: product?.nameEn || 'Unknown',
            sold: p._sum.quantity || 0,
            revenue: Number(p._sum.total || 0),
          };
        }),
        recentOrders: recentOrders.map((o) => ({
          id: o.id, orderNumber: o.orderNumber, customerName: o.user.name || o.user.phone,
          total: Number(o.total), status: o.status, date: o.createdAt.toISOString(),
        })),
        salesByCategory: Object.entries(categoryStats).map(([category, stats]) => ({
          category, sales: stats.sales,
          percentage: totalSales > 0 ? Math.round((stats.sales / totalSales) * 100) : 0,
        })).sort((a, b) => b.sales - a.sales),
      },
    });
  } catch (error) { next(error); }
});

// ============ CATEGORIES (full CRUD) ============
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        parent: { select: { id: true, nameAr: true, nameEn: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id, nameAr: cat.nameAr, nameEn: cat.nameEn, slug: cat.slug,
        icon: cat.icon, image: cat.image, parentId: cat.parentId, parent: cat.parent,
        sortOrder: cat.sortOrder, isActive: cat.isActive,
        productCount: cat._count.products, childrenCount: cat._count.children,
        createdAt: cat.createdAt,
      })),
    });
  } catch (error) { next(error); }
});

// ============ SETTINGS MANAGEMENT ============

/**
 * GET /api/admin/settings
 * Get all settings as key-value object
 */
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.json({ success: true, data: settingsMap });
  } catch (error) { next(error); }
});

/**
 * GET /api/admin/settings/:key
 * Get a specific setting by key
 */
router.get('/settings/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await prisma.setting.findUnique({ where: { key } });
    if (!setting) {
      throw new AppError('Setting not found', 404);
    }
    res.json({ success: true, data: setting });
  } catch (error) { next(error); }
});

/**
 * PUT /api/admin/settings
 * Update multiple settings at once
 */
router.put('/settings', async (req, res, next) => {
  try {
    const updates = req.body as Record<string, any>;

    await prisma.$transaction(
      Object.entries(updates).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) { next(error); }
});

/**
 * PUT /api/admin/settings/:key
 * Update a specific setting
 */
router.put('/settings/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json({ success: true, data: setting });
  } catch (error) { next(error); }
});

// ============ MATERIAL LIST - ADD TO CART ============

/**
 * POST /api/admin/material-lists/:id/add-to-cart
 * Admin adds products to user's cart from material list
 */
router.post('/material-lists/:id/add-to-cart', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { products } = req.body as { products: { productId: string; quantity: number }[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new AppError('Products array is required', 400);
    }

    const list = await prisma.materialList.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!list) {
      throw new AppError('Material list not found', 404);
    }

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: list.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: list.userId },
      });
    }

    // Add products to cart in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of products) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) continue;

        // Check if already in cart
        const existingItem = await tx.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: cart!.id,
              productId: item.productId,
            },
          },
        });

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: cart!.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }

      // Update material list status and save cart snapshot
      await tx.materialList.update({
        where: { id },
        data: {
          status: 'ready',
          processedAt: new Date(),
          cartSnapshot: products,
          assignedTo: req.user!.id,
        },
      });
    });

    // Send SMS notification to user
    await smsService.sendMaterialListReady(list.user.phone);

    res.json({
      success: true,
      message: 'Products added to customer cart',
      data: {
        productsAdded: products.length,
        userId: list.userId,
      },
    });
  } catch (error) { next(error); }
});

export default router;
