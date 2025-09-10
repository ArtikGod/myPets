import {config} from 'dotenv';
config()
import express from "express";
import bodyParser from "body-parser";
import { Request, Response, NextFunction, Application } from 'express';

// Initialize database connection before routes and bot
import { connectDb } from "./connectdb";
import { setupSwagger } from "./swagger";

const app: Application  = express();
app.use(bodyParser.json());
app.use((req: Request, res: Response, next: NextFunction ) => {
    res.header('Access-Control-Allow-Origin', `${process.env.HOST}:${process.env.PORT}/`);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Setup Swagger documentation
setupSwagger(app);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Проверка состояния сервера
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Сервер работает нормально
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
// Health check endpoint for testing
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

export  { app };

// Import routes after export to avoid circular dependency
import "./users/userRoutes";
import "./vehicle/vehicleRoutes";
import "./reservations/reservationsRoutes";
if (process.env.NODE_ENV !== 'test' || process.env.PERFORMANCE_TEST === 'true') {
    // Ensure DB connection is established when not in test or during performance tests
     connectDb().catch(() => {
        console.warn('DB not connected. Running without database.');
     });
    if (process.env.NODE_ENV !== 'test') {
        import ("./telegrambot")
    }
}
