import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getUsers,
  getUserById,
  updateUser,
  getStats,
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

router.get('/stats', getStats);

router.get('/exercises', getExercises);
router.post('/exercises', createExercise);
router.put('/exercises/:id', updateExercise);
router.delete('/exercises/:id', deleteExercise);

export default router;