import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProgress,
  getProgressChart,
  getProgressStats,
} from '../controllers/progressController';

const router = Router();

router.use(authenticate);

router.get('/', getProgress);
router.get('/chart', getProgressChart);
router.get('/stats', getProgressStats);

export default router;