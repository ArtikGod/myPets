import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import appealsRouter from './routes/routes';
import { ERROR_MESSAGES } from './config/constants';

const app: Application  = express();

app.use(bodyParser.json());
app.use('/appeals', appealsRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: ERROR_MESSAGES.INVALID_REQUEST });
});

export default app;