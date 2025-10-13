import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDatabase, disconnectDatabase } from './utils/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import config, { isDevelopment } from './utils/config';
import { CORS_CONFIG, RATE_LIMIT_CONFIG } from './constants';

import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import customTaskRoutes from './routes/customTaskRoutes';
import progressRoutes from './routes/progressRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : undefined,
}));

app.use(cors(CORS_CONFIG));

const limiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: {
    success: false,
    error: RATE_LIMIT_CONFIG.MESSAGE,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
}

app.get('/health', async (req, res) => {
  try {
    const dbHealth = await import('./utils/database').then(db => db.healthCheck());
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealth ? 'connected' : 'disconnected',
        environment: config.nodeEnv,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        environment: config.nodeEnv,
      },
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/custom-tasks', customTaskRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    const server = app.listen(config.port, () => {
      console.log(`🚀 Сервер запущен на порту ${config.port}`);
      console.log(`🌍 Окружение: ${config.nodeEnv}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      
      if (isDevelopment) {
        console.log(`📖 API документация будет доступна по адресу: http://localhost:${config.port}/api`);
      }
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Получен сигнал ${signal}. Завершение работы...`);
      
      server.close(async () => {
        console.log('🔌 HTTP сервер закрыт');
        
        try {
          await disconnectDatabase();
          console.log('✅ Приложение завершено корректно');
          process.exit(0);
        } catch (error) {
          console.error('❌ Ошибка при завершении работы:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error('⏰ Принудительное завершение работы');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;