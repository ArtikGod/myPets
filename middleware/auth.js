const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("../db");
const SessionService = require("../services/sessionService");
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    HTTP_STATUS,
    SQL_QUERIES,
    TOKEN_TYPES,
    DEVICE,
} = require("../shared/constants");

module.exports = {
    authenticateToken: async (req, res, next) => {
        const authHeader = req.headers[SUCCESS_MESSAGES.AUTHORIZATION];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ error: ERROR_MESSAGES.UNAUTHORIZED });
        }

        try {
            const decoded = jwt.verify(token, config.JWT.SECRET);

            const [rows] = await db
                .getPool()
                .execute(SQL_QUERIES.AUTH.SELECT_BLOCKED_TOKEN, [
                    token,
                    TOKEN_TYPES.ACCESS,
                ]);

            if (rows.length > 0) {
                return res
                    .status(HTTP_STATUS.FORBIDDEN)
                    .json({ error: ERROR_MESSAGES.FORBIDDEN });
            }

            if (decoded.sessionId) {
                const session = await SessionService.getSessionById(
                    decoded.sessionId
                );
                if (!session) {
                    return res
                        .status(HTTP_STATUS.UNAUTHORIZED)
                        .json({ error: ERROR_MESSAGES.TOKEN_EXPIRED });
                }
            }

            req.user = decoded;
            next();
        } catch (err) {
            if (err.name === ERROR_MESSAGES.ERR_TOKEN_EXPIRED) {
                return res
                    .status(HTTP_STATUS.UNAUTHORIZED)
                    .json({ error: ERROR_MESSAGES.TOKEN_EXPIRED });
            }
            return res
                .status(HTTP_STATUS.FORBIDDEN)
                .json({ error: ERROR_MESSAGES.FORBIDDEN });
        }
    },

    generateTokens: (userId, sessionId = null) => {
        const payload = { userId };
        if (sessionId) {
            payload.sessionId = sessionId;
        }

        const accessToken = jwt.sign(payload, config.JWT.SECRET, {
            expiresIn: config.JWT.ACCESS_EXPIRES,
        });

        const refreshToken = jwt.sign(payload, config.JWT.REFRESH_SECRET, {
            expiresIn: config.JWT.REFRESH_EXPIRES,
        });

        return { accessToken, refreshToken };
    },

    extractDeviceInfo: (req) => {
        return {
            ip:
                req.ip ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress,
            userAgent: req.get("User-Agent") || "",
            deviceName: req.get("X-Device-Name") || DEVICE.UNKNOWN_DEVICE,
        };
    },

    blockToken: async (
        token,
        tokenType = TOKEN_TYPES.ACCESS,
        userId = null
    ) => {
        try {
            let expiresAt = null;
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.exp) {
                    expiresAt = new Date(decoded.exp * 1000);
                }
            } catch (err) {}

            await db
                .getPool()
                .execute(SQL_QUERIES.AUTH.INSERT_BLOCKED_TOKEN, [
                    token,
                    tokenType,
                    userId,
                    expiresAt,
                ]);
        } catch (error) {
            console.error(ERROR_MESSAGES.TOKEN_BLOCK_ERROR, error);
            throw error;
        }
    },
};
