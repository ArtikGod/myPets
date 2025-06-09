import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet'; 
import rateLimit from 'express-rate-limit';
import appealsRouter from './routes/routes';
import { ERROR_MESSAGES, LIMIT } from './config/constants';
import { StatusCodes } from 'http-status-codes';

const app: Application  = express();

app.use(helmet());
app.use(bodyParser.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: LIMIT.TIME,
  max: LIMIT.MAX_RATE,
  standardHeaders: true,
  legacyHeaders: false,
  message: ERROR_MESSAGES.TOO_MANY_REQUESTS
});
app.use(limiter);

app.use('/appeals', appealsRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.INVALID_REQUEST });
});

export default app;