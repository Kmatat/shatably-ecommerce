import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const createListSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  notes: z.string().optional(),
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const lists = await prisma.materialList.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: lists.map((list) => ({
        id: list.id, fileName: list.fileName, fileUrl: list.fileUrl, fileType: list.fileType,
        notes: list.notes, status: list.status, createdAt: list.createdAt, processedAt: list.processedAt,
      })),
    });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await prisma.materialList.findFirst({ where: { id, userId: req.user!.id } });
    if (!list) throw new AppError('Material list not found', 404);
    res.json({ success: true, data: list });
  } catch (error) { next(error); }
});

router.post('/', validateBody(createListSchema), async (req, res, next) => {
  try {
    const pendingCount = await prisma.materialList.count({
      where: { userId: req.user!.id, status: { in: ['pending', 'processing'] } },
    });
    if (pendingCount >= 3) throw new AppError('You have too many pending lists. Please wait.', 400);

    const list = await prisma.materialList.create({
      data: { ...req.body, userId: req.user!.id, status: 'pending' },
    });

    res.status(201).json({ success: true, message: 'Material list submitted', data: { id: list.id, status: list.status } });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const list = await prisma.materialList.findFirst({ where: { id, userId: req.user!.id } });
    if (!list) throw new AppError('Material list not found', 404);
    if (!['pending', 'cancelled'].includes(list.status)) throw new AppError('Cannot delete processed list', 400);

    await prisma.materialList.delete({ where: { id } });
    res.json({ success: true, message: 'Material list deleted' });
  } catch (error) { next(error); }
});

export default router;
