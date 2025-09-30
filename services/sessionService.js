const crypto = require("crypto");
const db = require("../db");
const config = require("../config");
const constants = require("../shared/constants");

class SessionService {
    static async createSession(userId, deviceInfo = {}) {
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(
            Date.now() + this.parseTimeToMs(config.JWT.REFRESH_EXPIRES)
        );

        const { ip, userAgent, deviceName } = deviceInfo;

        try {
            await db
                .getPool()
                .execute(constants.SQL_QUERIES.SESSION.INSERT_SESSION, [
                    userId,
                    sessionId,
                    config.SESSION.DEFAULT_REFRESH_TOKEN,
                    JSON.stringify({ deviceName }),
                    ip,
                    userAgent,
                    expiresAt,
                ]);

            return sessionId;
        } catch (error) {
            console.error(constants.ERROR_MESSAGES.SESSION_CREATE_ERROR, error);
            throw error;
        }
    }

    static async updateSessionRefreshToken(sessionId, refreshToken) {
        try {
            await db
                .getPool()
                .execute(constants.SQL_QUERIES.SESSION.UPDATE_REFRESH_TOKEN, [
                    refreshToken,
                    sessionId,
                ]);
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_UPDATE_REFRESH_TOKEN_ERROR,
                error
            );
            throw error;
        }
    }

    static async getSessionByRefreshToken(refreshToken) {
        try {
            const [rows] = await db
                .getPool()
                .execute(
                    constants.SQL_QUERIES.SESSION.SELECT_BY_REFRESH_TOKEN,
                    [refreshToken]
                );

            return rows[0] || null;
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_GET_BY_REFRESH_TOKEN_ERROR,
                error
            );
            throw error;
        }
    }

    static async getSessionById(sessionId) {
        try {
            const [rows] = await db
                .getPool()
                .execute(constants.SQL_QUERIES.SESSION.SELECT_BY_SESSION_ID, [
                    sessionId,
                ]);

            return rows[0] || null;
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_GET_BY_ID_ERROR,
                error
            );
            throw error;
        }
    }

    static async deactivateSession(sessionId) {
        try {
            await db
                .getPool()
                .execute(constants.SQL_QUERIES.SESSION.DEACTIVATE_SESSION, [
                    sessionId,
                ]);
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_DEACTIVATE_ERROR,
                error
            );
            throw error;
        }
    }

    static async deactivateAllUserSessions(userId) {
        try {
            await db
                .getPool()
                .execute(
                    constants.SQL_QUERIES.SESSION.DEACTIVATE_ALL_USER_SESSIONS,
                    [userId]
                );
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_DEACTIVATE_ALL_ERROR,
                error
            );
            throw error;
        }
    }

    static async getUserActiveSessions(userId) {
        try {
            const [rows] = await db
                .getPool()
                .execute(
                    constants.SQL_QUERIES.SESSION.SELECT_USER_ACTIVE_SESSIONS,
                    [userId]
                );

            return rows;
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_GET_ACTIVE_ERROR,
                error
            );
            throw error;
        }
    }

    static async cleanupExpiredSessions() {
        try {
            const [result] = await db
                .getPool()
                .execute(constants.SQL_QUERIES.SESSION.DELETE_EXPIRED_SESSIONS);

            console.log(
                constants.SUCCESS_MESSAGES.SESSIONS_CLEANED_UP.replace(
                    "{count}",
                    result.affectedRows
                )
            );
            return result.affectedRows;
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_CLEANUP_ERROR,
                error
            );
            throw error;
        }
    }

    static async checkSessionLimit(
        userId,
        maxSessions = config.SESSION.MAX_SESSIONS_PER_USER
    ) {
        try {
            const [rows] = await db
                .getPool()
                .execute(constants.SQL_QUERIES.SESSION.COUNT_USER_SESSIONS, [
                    userId,
                ]);

            const currentSessions = rows[0].count;

            if (currentSessions >= maxSessions) {
                await db
                    .getPool()
                    .execute(
                        constants.SQL_QUERIES.SESSION.DEACTIVATE_OLDEST_SESSION,
                        [userId]
                    );
            }

            return currentSessions;
        } catch (error) {
            console.error(
                constants.ERROR_MESSAGES.SESSION_CHECK_LIMIT_ERROR,
                error
            );
            throw error;
        }
    }

    static parseTimeToMs(timeString) {
        const units = config.SESSION.TIME_UNITS;

        const match = timeString.match(constants.VALIDATION.TIME_FORMAT_REGEX);
        if (!match) {
            throw new Error(
                `${constants.ERROR_MESSAGES.INVALID_TIME_FORMAT}: ${timeString}`
            );
        }

        const [, value, unit] = match;
        return parseInt(value) * units[unit];
    }
}

module.exports = SessionService;
