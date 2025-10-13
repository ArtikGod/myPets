import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  generateExercise,
  generateCustomTask,
  generateBulkExercises,
  getAIStatus,
  improveExercise,
  getCategories,
  getPrompts,
} from '../controllers/aiController';

const router = Router();

router.get('/status', getAIStatus);
router.use(authenticate);
router.get('/categories', getCategories);
router.get('/prompts', requireAdmin, getPrompts);
router.post('/generate-exercise', requireAdmin, generateExercise);
router.post('/generate-custom-task', generateCustomTask);
router.post('/generate-bulk-exercises', requireAdmin, generateBulkExercises);
router.post('/improve-exercise/:exerciseId', requireAdmin, improveExercise);

export default router;