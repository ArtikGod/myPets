import { Router, Request, Response, NextFunction } from 'express';
import { AppealService } from '../services/service';
import { body, param, query, validationResult } from 'express-validator';
import { StatusCodes } from "http-status-codes";
import { 
  APPEAL_STATUS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  VALIDATION_MESSAGES, 
  VALIDATION_RULES
} from '../config/constants';

const router = Router();
const appealService = new AppealService();
const validateIdParam = [
  param('id').isInt({ min: 1 }).withMessage(VALIDATION_MESSAGES.INVALID_ID)
];

router.post('/',
  [
    body('topic')
      .trim()
      .isLength({ min: VALIDATION_RULES.TOPIC_MIN_LENGTH, max: VALIDATION_RULES.TOPIC_MAX_LENGTH })
      .withMessage(VALIDATION_MESSAGES.TOPIC_LENGTH),
    body('description')
      .trim()
      .isLength({ min: VALIDATION_RULES.RESOLUTION_MIN_LENGTH, max: VALIDATION_RULES.RESOLUTION_MAX_LENGTH })
      .withMessage(VALIDATION_MESSAGES.DESTRUCTION_LENGTH),
  ],
  async (req: Request, res: Response, next: NextFunction) => {

    const validate = validationResult(req);
    const { topic, description } = req.body;
    
    if (!validate.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        errors: validate.array() 
      });
    }

      const appeal = await appealService.createAppeal(topic, description);
      res.status(StatusCodes.CREATED).json({ 
        message: SUCCESS_MESSAGES.APPEAL_CREATED, 
        data: appeal 
      });
});

router.put('/:id/take-in-work', 
   [...validateIdParam],
   async (req: Request, res: Response) => {
     const { id } = req.params;
     const validate = validationResult(req);

      if (!validate.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          errors: validate.array() 
        });
      };
     
    try {
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

router.put('/:id/complete',
  [...validateIdParam,
     body('resolutionText')
      .trim()
      .isLength({ min: VALIDATION_RULES.RESOLUTION_MIN_LENGTH, max: VALIDATION_RULES.RESOLUTION_MAX_LENGTH })
      .withMessage(VALIDATION_MESSAGES.RESOLUTION_LENGTH)
  ],
  async (req: Request, res: Response)=> {
  
    const { id } = req.params;
    const { resolutionText } = req.body;
    const validate = validationResult(req);

     if (!validate.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        errors: validate.array() 
      });
    }

    try {
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

router.put('/:id/cancel',
  [...validateIdParam,
     body('cancellationReason')
      .trim()
      .isLength({ min: VALIDATION_RULES.RESOLUTION_MIN_LENGTH, max: VALIDATION_RULES.RESOLUTION_MAX_LENGTH })
      .withMessage(VALIDATION_MESSAGES.RESOLUTION_LENGTH)
  ],
  async (req: Request, res: Response) => {
 
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        errors: validate.array() 
      });
    }

    try {
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

router.get('/', 
  [
    query('startDate').optional().isISO8601().toDate().withMessage(VALIDATION_MESSAGES.INVALID_DATE),
    query('endDate').optional().isISO8601().toDate().withMessage(VALIDATION_MESSAGES.INVALID_DATE)
  ],
  async (req: Request, res: Response, next: NextFunction) => {

    const { startDate, endDate } = req.query;
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
      errors: validate.array() 
      });
    }

    const parsedStart = startDate as Date | undefined;
    const parsedEnd = endDate as Date | undefined;

    const appeals = await appealService.getAppeals(parsedStart, parsedEnd);
    res.json({ data: appeals });
});

router.get('/:id', 
  [...validateIdParam],
  async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
      errors: validate.array() 
      });
    }

    const appeal = await appealService.getAppealById(Number(id));
      
      if (!appeal) {
        return res.status(StatusCodes.NOT_FOUND).json({ 
          error: ERROR_MESSAGES.APPEAL_NOT_FOUND 
        });
      }
      
      res.json({ data: appeal });
});

router.post('/cancel-all-in-progress',
  [
    body('cancellationReason')
      .trim()
      .isLength({ min: VALIDATION_RULES.RESOLUTION_MIN_LENGTH, max: VALIDATION_RULES.RESOLUTION_MAX_LENGTH })
      .withMessage(VALIDATION_MESSAGES.RESOLUTION_LENGTH)
  ],
  async (req: Request, res: Response) => {

    const { cancellationReason } = req.body;
    const validate = validationResult(req);

     if (!validate.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
      errors: validate.array() 
      });
    }

    try {
      await appealService.cancelAllInProgress(cancellationReason);
      res.json({ 
        message: SUCCESS_MESSAGES.BATCH_CANCELED 
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
});

function handleAppealError(error: Error, res: Response) {
  if (error.message === ERROR_MESSAGES.APPEAL_NOT_FOUND) {
    return res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
  if (error.message === ERROR_MESSAGES.INVALID_STATUS_TRANSITION) {
    return res.status(StatusCodes.CONFLICT).json({ error: error.message });
  }
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
}

export default router;