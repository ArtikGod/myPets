import { Router } from 'express';
import {
  getTodayTask,
  completeTask,
  getTaskHistory,
  getUserProgress,
  getTaskById,
  skipTask,
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/today', getTodayTask);
router.get('/history', getTaskHistory);
router.get('/progress', getUserProgress);
router.get('/:id', getTaskById);
router.post('/:id/complete', completeTask);
router.post('/:id/skip', skipTask);

export default router;