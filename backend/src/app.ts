import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import ideasRouter from './routes/ideas';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/ideas', ideasRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;