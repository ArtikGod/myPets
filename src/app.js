const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const APP_CONSTANTS = require("./constants/constants");
const {
    loggerMiddleware,
    getLogStats,
    getRecentLogs,
} = require("./middleware/logger");
const { errorHandler, notFoundHandler } = require("./middleware/validation");

const orderRoutes = require("./routes/orderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

class App {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        this.app.use(helmet());

        this.app.use(
            cors({
                origin: process.env.CORS_ORIGIN
                    ? process.env.CORS_ORIGIN.split(",")
                    : APP_CONSTANTS.SERVER_CONFIG.CORS_ORIGINS,
                credentials: true,
            })
        );

        this.app.use(
            express.json({ limit: APP_CONSTANTS.SERVER_CONFIG.BODY_LIMIT })
        );
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use(express.static(path.join(__dirname, "../frontend/dist")));

        this.app.use(loggerMiddleware);
    }

    setupRoutes() {
        this.app.use(`/api${APP_CONSTANTS.API_ENDPOINTS.ORDERS}`, orderRoutes);
        this.app.use("/api/analytics", analyticsRoutes);

        this.app.get(
            `/api${APP_CONSTANTS.API_ENDPOINTS.LOG_STATS}`,
            getLogStats
        );
        this.app.get("/api/logs/recent", getRecentLogs);

        this.app.get(APP_CONSTANTS.API_ENDPOINTS.HEALTH, (req, res) => {
            res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: APP_CONSTANTS.SUCCESS_MESSAGES.HEALTH_CHECK,
                timestamp: new Date().toISOString(),
                version: APP_CONSTANTS.SERVER_CONFIG.API_VERSION,
            });
        });

        this.app.get("/api", (req, res) => {
            res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: "API сервиса управления заказами",
                version: APP_CONSTANTS.SERVER_CONFIG.API_VERSION,
                endpoints: {
                    orders: {
                        [`POST /api${APP_CONSTANTS.API_ENDPOINTS.ORDERS}`]:
                            "Создать заказ",
                        [`GET /api${APP_CONSTANTS.API_ENDPOINTS.ORDERS}/:id`]:
                            "Получить заказ по ID",
                        [`GET /api${APP_CONSTANTS.API_ENDPOINTS.ORDERS}`]:
                            "Получить все заказы",
                    },
                    analytics: {
                        [`GET /api${APP_CONSTANTS.API_ENDPOINTS.ANALYTICS_WEEKLY}`]:
                            "Аналитика за последние 7 дней",
                        [`GET /api${APP_CONSTANTS.API_ENDPOINTS.ANALYTICS_SUMMARY}`]:
                            "Общая аналитика",
                    },
                    system: {
                        [`GET /api${APP_CONSTANTS.API_ENDPOINTS.HEALTH}`]:
                            "Проверка состояния сервиса",
                        [`GET /api${APP_CONSTANTS.API_ENDPOINTS.LOG_STATS}`]:
                            "Статистика логов",
                        "GET /api/logs/recent": "Последние логи",
                    },
                },
            });
        });

        this.app.get("*", (req, res) => {
            if (!req.path.startsWith("/api")) {
                res.sendFile(
                    path.join(__dirname, "../frontend/dist/index.html")
                );
            } else {
                notFoundHandler(req, res);
            }
        });
    }

    setupErrorHandling() {
        this.app.use("/api/*", notFoundHandler);

        this.app.use(errorHandler);
    }

    getApp() {
        return this.app;
    }
}

module.exports = new App().getApp();
