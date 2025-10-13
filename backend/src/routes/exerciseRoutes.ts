import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  res.json({ success: true, data: [], message: 'Exercises route placeholder' });
});

export default router;