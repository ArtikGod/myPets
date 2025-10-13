import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createCustomTask,
  getUserCustomTasks,
  getCustomTaskById,
  updateCustomTask,
  deleteCustomTask,
  completeCustomTask,
  toggleCustomTask,
} from '../controllers/customTaskController';

const router = Router();

router.use(authenticate);
router.post('/', createCustomTask);
router.get('/', getUserCustomTasks);
router.get('/:id', getCustomTaskById);
router.put('/:id', updateCustomTask);
router.delete('/:id', deleteCustomTask);
router.post('/:id/complete', completeCustomTask);
router.post('/:id/toggle', toggleCustomTask);

export default router;