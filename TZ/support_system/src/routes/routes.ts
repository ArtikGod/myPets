import { Router, Request, Response } from 'express';
import { AppealService } from '../services/service';

import { 
  APPEAL_STATUS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../config/constants';

const router = Router();
const appealService = new AppealService();

router.post('/',
   async (req: Request, res: Response) => {
    try {
      const { topic, description } = req.body;
    
    if (!topic?.trim() || !description?.trim()) {
      return res.status(400).json({ 
        error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS 
      });
    }

    const appeal = await appealService.createAppeal(topic, description);
    res.status(201).json({ 
      message: SUCCESS_MESSAGES.APPEAL_CREATED, 
      data: appeal 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/take-in-work', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const updatedAppeal = await appealService.updateStatus(
      Number(id),
      APPEAL_STATUS.IN_PROGRESS
    );
    
    res.json({ 
      message: SUCCESS_MESSAGES.STATUS_UPDATED, 
      data: updatedAppeal 
    });
  } catch (error) {
    handleAppealError(error, res);
  }
});

router.put('/:id/complete', async (req: Request, res: Response)=> {
  try {
    const { id } = req.params;
    const { resolutionText } = req.body;

    if (!resolutionText?.trim()) {
      return res.status(400).json({ 
        error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS 
      });
    }

    const updatedAppeal = await appealService.updateStatus(
      Number(id),
      APPEAL_STATUS.COMPLETED,
      resolutionText
    );
    
    res.json({ 
      message: SUCCESS_MESSAGES.STATUS_UPDATED, 
      data: updatedAppeal 
    });
  } catch (error) {
    handleAppealError(error, res);
  }
});

router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    if (!cancellationReason?.trim()) {
      return res.status(400).json({ 
        error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS 
      });
    }

    const updatedAppeal = await appealService.updateStatus(
      Number(id),
      APPEAL_STATUS.CANCELED,
      undefined,
      cancellationReason
    );
    
    res.json({ 
      message: SUCCESS_MESSAGES.STATUS_UPDATED, 
      data: updatedAppeal 
    });
  } catch (error) {
    handleAppealError(error, res);
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const parsedStart = startDate ? new Date(startDate as string) : undefined;
    const parsedEnd = endDate ? new Date(endDate as string) : undefined;

    if ((startDate && parsedStart && isNaN(parsedStart.getTime())) || 
        (endDate && parsedEnd && isNaN(parsedEnd.getTime()))) {
      return res.status(400).json({ 
        error: ERROR_MESSAGES.INVALID_DATE_FORMAT 
      });
    }

    const appeals = await appealService.getAppeals(parsedStart, parsedEnd);
    res.json({ data: appeals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appeal = await appealService.getAppealById(Number(id));
    
    if (!appeal) {
      return res.status(404).json({ 
        error: ERROR_MESSAGES.APPEAL_NOT_FOUND 
      });
    }
    
    res.json({ data: appeal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cancel-all-in-progress', async (req: Request, res: Response) => {
  try {
    const { cancellationReason } = req.body;

    if (!cancellationReason?.trim()) {
      return res.status(400).json({ 
        error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS 
      });
    }

    await appealService.cancelAllInProgress(cancellationReason);
    res.json({ 
      message: SUCCESS_MESSAGES.BATCH_CANCELED 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function handleAppealError(error: Error, res: Response) {
  if (error.message === ERROR_MESSAGES.APPEAL_NOT_FOUND) {
    return res.status(404).json({ error: error.message });
  }
  if (error.message === ERROR_MESSAGES.INVALID_STATUS_TRANSITION) {
    return res.status(409).json({ error: error.message });
  }
  res.status(500).json({ error: error.message });
}

export default router;