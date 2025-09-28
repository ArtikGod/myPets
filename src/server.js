require("dotenv").config();
const app = require("./app");
const APP_CONSTANTS = require("./constants/constants");

const PORT = APP_CONSTANTS.PORT;

const server = app.listen(PORT, () => {
    console.log(`\n${APP_CONSTANTS.CONSOLE_MESSAGES.SERVER_STARTING}`);
    console.log(`${APP_CONSTANTS.CONSOLE_MESSAGES.SERVER_RUNNING} ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📋 API документация: http://localhost:${PORT}/api`);
    console.log(
        `💊 Health check: http://localhost:${PORT}${APP_CONSTANTS.API_ENDPOINTS.HEALTH}`
    );
    console.log(
        `📊 Аналитика: http://localhost:${PORT}${APP_CONSTANTS.API_ENDPOINTS.ANALYTICS_WEEKLY}`
    );
    console.log(
        `📝 Логи: http://localhost:${PORT}${APP_CONSTANTS.API_ENDPOINTS.LOG_STATS}`
    );
    console.log(`🎯 Окружение: ${APP_CONSTANTS.NODE_ENV}`);
    console.log(
        APP_CONSTANTS.CONSOLE_MESSAGES.SEPARATOR.repeat(
            APP_CONSTANTS.SERVER_CONFIG.SEPARATOR_LENGTH
        )
    );
});

process.on("SIGTERM", () => {
    console.log("\n🛑 Получен сигнал SIGTERM. Завершение работы сервера...");
    server.close(() => {
        console.log("✅ Сервер успешно остановлен");
        process.exit(0);
    });
});

process.on("SIGINT", () => {
    console.log("\n🛑 Получен сигнал SIGINT. Завершение работы сервера...");
    server.close(() => {
        console.log("✅ Сервер успешно остановлен");
        process.exit(0);
    });
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Необработанное отклонение Promise:", reason);
    server.close(() => {
        process.exit(1);
    });
});

process.on("uncaughtException", (error) => {
    console.error("❌ Необработанное исключение:", error);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = server;
