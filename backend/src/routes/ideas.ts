import { Router } from 'express';
import { IdeasController } from '../controllers/ideasController';

const router = Router();

router.get('/', IdeasController.getIdeas);
router.get('/:id/vote-status', IdeasController.checkVoteStatus);
router.post('/:id/vote', IdeasController.voteForIdea);

export default router;