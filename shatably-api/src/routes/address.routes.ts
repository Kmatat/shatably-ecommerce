import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { validateEgyptPhone } from '../utils/helpers';

const router = Router();

const addressSchema = z.object({
  label: z.string().min(1).max(50),
  fullAddress: z.string().min(10).max(500),
  area: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  governorate: z.string().min(2).max(100),
  landmark: z.string().max(200).optional(),
  contactName: z.string().min(2).max(100),
  contactPhone: z.string().refine(validateEgyptPhone, { message: 'Invalid phone number' }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: addresses });
  } catch (error) { next(error); }
});

router.post('/', validateBody(addressSchema), async (req, res, next) => {
  try {
    const addressCount = await prisma.address.count({ where: { userId: req.user!.id } });
    if (addressCount >= 10) throw new AppError('Maximum 10 addresses allowed', 400);

    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
    }

    const isFirst = addressCount === 0;
    const address = await prisma.address.create({
      data: { ...req.body, userId: req.user!.id, isDefault: isFirst || req.body.isDefault },
    });

    res.status(201).json({ success: true, data: address });
  } catch (error) { next(error); }
});

router.put('/:id', validateBody(addressSchema.partial()), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.address.findFirst({ where: { id, userId: req.user!.id } });
    if (!existing) throw new AppError('Address not found', 404);

    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user!.id, id: { not: id } }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({ where: { id }, data: req.body });
    res.json({ success: true, data: address });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.address.findFirst({ where: { id, userId: req.user!.id } });
    if (!existing) throw new AppError('Address not found', 404);

    await prisma.address.delete({ where: { id } });

    if (existing.isDefault) {
      const firstAddress = await prisma.address.findFirst({ where: { userId: req.user!.id }, orderBy: { createdAt: 'asc' } });
      if (firstAddress) await prisma.address.update({ where: { id: firstAddress.id }, data: { isDefault: true } });
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) { next(error); }
});

export default router;
