const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const {
    generateTokens,
    extractDeviceInfo,
    blockToken,
} = require("../middleware/auth");
const SessionService = require("../services/sessionService");
const ValidationService = require("../services/validationService");
const config = require("../config");
const {
    ERROR_MESSAGES,
    SECURITY,
    HTTP_STATUS,
    SQL_QUERIES,
    SUCCESS_MESSAGES,
    TOKEN_TYPES,
} = require("../shared/constants");

router.post("/signup", async (req, res) => {
    const { id, password } = req.body;

    const userIdValidation = ValidationService.validateUserId(id);
    if (!userIdValidation.isValid) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: userIdValidation.error });
    }

    const passwordValidation = ValidationService.validatePassword(password);
    if (!passwordValidation.isValid) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: passwordValidation.error });
    }

    const normalizedId = userIdValidation.normalizedId;

    try {
        const [existing] = await db
            .getPool()
            .execute(SQL_QUERIES.AUTH.SELECT_USER_BY_ID, [normalizedId]);

        if (existing.length > 0) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ error: ERROR_MESSAGES.USER_EXISTS });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            SECURITY.PASSWORD_SALT_ROUNDS
        );

        await db
            .getPool()
            .execute(SQL_QUERIES.AUTH.INSERT_USER, [
                normalizedId,
                hashedPassword,
            ]);

        const deviceInfo = extractDeviceInfo(req);
        const sessionId = await SessionService.createSession(
            normalizedId,
            deviceInfo
        );

        const tokens = generateTokens(normalizedId, sessionId);

        await SessionService.updateSessionRefreshToken(
            sessionId,
            tokens.refreshToken
        );

        res.status(HTTP_STATUS.CREATED).json({
            ...tokens,
            sessionId,
            message: SUCCESS_MESSAGES.USER_REGISTERED,
        });
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

router.post("/signin", async (req, res) => {
    const { id, password } = req.body;

    const userIdValidation = ValidationService.validateUserId(id);
    if (!userIdValidation.isValid) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: userIdValidation.error });
    }

    if (
        !password ||
        typeof password !== "string" ||
        password.trim().length === 0
    ) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: ERROR_MESSAGES.ID_PASSWORD_REQUIRED });
    }

    const normalizedId = userIdValidation.normalizedId;

    try {
        const [users] = await db
            .getPool()
            .execute(SQL_QUERIES.AUTH.SELECT_USER_BY_ID, [normalizedId]);

        if (users.length === 0) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        const deviceInfo = extractDeviceInfo(req);
        await SessionService.checkSessionLimit(normalizedId);
        const sessionId = await SessionService.createSession(
            normalizedId,
            deviceInfo
        );

        const tokens = generateTokens(normalizedId, sessionId);

        await SessionService.updateSessionRefreshToken(
            sessionId,
            tokens.refreshToken
        );

        res.json({
            ...tokens,
            sessionId,
            message: SUCCESS_MESSAGES.LOGGED_IN,
        });
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

router.post("/signin/new_token", async (req, res) => {
    const { refreshToken } = req.body;

    const tokenValidation =
        ValidationService.validateRefreshToken(refreshToken);
    if (!tokenValidation.isValid) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: tokenValidation.error });
    }

    const validatedToken = tokenValidation.token;

    try {
        const decoded = jwt.verify(validatedToken, config.JWT.REFRESH_SECRET);

        const [rows] = await db
            .getPool()
            .execute(SQL_QUERIES.AUTH.SELECT_BLOCKED_TOKEN, [
                validatedToken,
                TOKEN_TYPES.REFRESH,
            ]);

        if (rows.length > 0) {
            return res
                .status(HTTP_STATUS.FORBIDDEN)
                .json({ error: ERROR_MESSAGES.FORBIDDEN });
        }

        const session = await SessionService.getSessionByRefreshToken(
            validatedToken
        );
        if (!session) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ error: ERROR_MESSAGES.INVALID_REFRESH });
        }

        await blockToken(validatedToken, TOKEN_TYPES.REFRESH, decoded.userId);

        const tokens = generateTokens(decoded.userId, session.session_id);

        await SessionService.updateSessionRefreshToken(
            session.session_id,
            tokens.refreshToken
        );

        res.json({
            ...tokens,
            message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
        });
    } catch (err) {
        if (err.name === ERROR_MESSAGES.ERR_TOKEN_EXPIRED) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ error: ERROR_MESSAGES.REFRESH_EXPIRED });
        }
        return res
            .status(HTTP_STATUS.FORBIDDEN)
            .json({ error: ERROR_MESSAGES.INVALID_REFRESH });
    }
});

module.exports = router;
