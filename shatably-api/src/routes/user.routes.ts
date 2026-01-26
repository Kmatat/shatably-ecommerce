// User routes placeholder
import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Placeholder - user profile handled in auth.routes.ts
router.get('/', (req, res) => {
  res.json({ success: true, message: 'User routes - see /api/auth for profile' });
});

export default router;
