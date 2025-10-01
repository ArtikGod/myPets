const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, blockToken } = require("../middleware/auth");
const SessionService = require("../services/sessionService");
const {
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    HTTP_STATUS,
    TOKEN_TYPES,
} = require("../shared/constants");

router.get("/info", authenticateToken, async (req, res) => {
    try {
        res.json({
            id: req.user.userId,
        });
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

router.get("/logout", authenticateToken, async (req, res) => {
    const authHeader = req.headers[SUCCESS_MESSAGES.AUTHORIZATION];
    const token = authHeader && authHeader.split(" ")[1];
    const userId = req.user.userId;
    const sessionId = req.user.sessionId;

    try {
        await blockToken(token, TOKEN_TYPES.ACCESS, userId);

        if (sessionId) {
            const session = await SessionService.getSessionById(sessionId);
            if (session) {
                await blockToken(session.refresh_token, TOKEN_TYPES.REFRESH, userId);
                await SessionService.deactivateSession(sessionId);
            }
        }

        res.json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
    } catch (err) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

module.exports = router;
