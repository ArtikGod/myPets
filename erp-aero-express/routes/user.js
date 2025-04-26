const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require("../shared/constants");

router.get("/info", authenticateToken, async (req, res) => {
    res.json({ id: req.user.userId });
});

router.get("/logout", authenticateToken, async (req, res) => {
    const authHeader = req.headers[SUCCESS_MESSAGES.AUTHORIZATION];
    const token = authHeader && authHeader.split(" ")[1];

    try {
        await db
            .getPool()
            .execute("INSERT INTO blocked_tokens (token) VALUES (?)", [token]);

        res.json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
});

module.exports = router;
