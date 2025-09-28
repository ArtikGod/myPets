const APP_CONSTANTS = require("../constants/constants");

class RequestLogger {
    constructor() {
        this.logs = [];
    }

    formatTime(date) {
        return date.toISOString().replace("T", " ").substring(0, 19);
    }

    getStatusColor(statusCode) {
        if (statusCode >= 200 && statusCode < 300)
            return APP_CONSTANTS.LOGGER_CONFIG.COLORS.GREEN;
        if (statusCode >= 300 && statusCode < 400)
            return APP_CONSTANTS.LOGGER_CONFIG.COLORS.YELLOW;
        if (statusCode >= 400 && statusCode < 500)
            return APP_CONSTANTS.LOGGER_CONFIG.COLORS.RED;
        if (statusCode >= 500)
            return APP_CONSTANTS.LOGGER_CONFIG.COLORS.MAGENTA;
        return APP_CONSTANTS.LOGGER_CONFIG.COLORS.RESET;
    }

    logRequest(method, url, statusCode, responseTime, userAgent = "") {
        const timestamp = this.formatTime(new Date());
        const colorCode = this.getStatusColor(statusCode);
        const resetColor = APP_CONSTANTS.LOGGER_CONFIG.COLORS.RESET;

        const logEntry = {
            timestamp,
            method,
            url,
            statusCode,
            responseTime,
            userAgent,
        };

        this.logs.push(logEntry);

        console.log(
            `${timestamp} - ${method} ${url} - ${colorCode}${statusCode}${resetColor} - ${responseTime}ms${
                userAgent ? ` - ${userAgent}` : ""
            }`
        );

        if (this.logs.length > APP_CONSTANTS.LOGGER_CONFIG.MAX_LOGS) {
            this.logs = this.logs.slice(-APP_CONSTANTS.LOGGER_CONFIG.MAX_LOGS);
        }
    }

    getStats() {
        const totalRequests = this.logs.length;
        const avgResponseTime =
            totalRequests > 0
                ? this.logs.reduce((sum, log) => sum + log.responseTime, 0) /
                  totalRequests
                : 0;

        const statusCounts = this.logs.reduce((acc, log) => {
            const statusRange = Math.floor(log.statusCode / 100) * 100;
            acc[statusRange] = (acc[statusRange] || 0) + 1;
            return acc;
        }, {});

        return {
            totalRequests,
            avgResponseTime:
                Math.round(
                    avgResponseTime *
                        APP_CONSTANTS.LOGGER_CONFIG.PERCENTAGE_MULTIPLIER
                ) / APP_CONSTANTS.LOGGER_CONFIG.PERCENTAGE_MULTIPLIER,
            statusCounts,
        };
    }

    getRecentLogs(limit = APP_CONSTANTS.LOGGER_CONFIG.DEFAULT_RECENT_LIMIT) {
        return this.logs.slice(-limit);
    }
}

const requestLogger = new RequestLogger();

const loggerMiddleware = (req, res, next) => {
    const startTime = Date.now();

    const originalSend = res.send;
    res.send = function (data) {
        const responseTime = Date.now() - startTime;
        const userAgent = req.get("User-Agent") || "";

        requestLogger.logRequest(
            req.method,
            req.originalUrl,
            res.statusCode,
            responseTime,
            userAgent
        );

        return originalSend.call(this, data);
    };

    next();
};

const getLogStats = (req, res) => {
    const stats = requestLogger.getStats();
    res.json({
        success: true,
        data: stats,
    });
};

const getRecentLogs = (req, res) => {
    const limit =
        parseInt(req.query.limit) ||
        APP_CONSTANTS.LOGGER_CONFIG.DEFAULT_RECENT_LIMIT;
    const logs = requestLogger.getRecentLogs(limit);
    res.json({
        success: true,
        data: logs,
    });
};

module.exports = {
    loggerMiddleware,
    getLogStats,
    getRecentLogs,
    requestLogger,
};
