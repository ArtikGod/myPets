const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../db");
const { generateTokens } = require("../middleware/auth");
const config = require("../config");
const { ERROR_MESSAGES, SECURITY } = require("../shared/constants");

router.post("/signup", async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res
            .status(400)
            .json({ error: ERROR_MESSAGES.ID_PASSWORD_REQUIRED });
    }

    try {
        const [existing] = await db
            .getPool()
            .execute("SELECT * FROM users WHERE id = ?", [id]);

        if (existing.length > 0) {
            return res.status(400).json({ error: ERROR_MESSAGES.USER_EXISTS });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            SECURITY.PASSWORD_SALT_ROUNDS
        );

        await db
            .getPool()
            .execute("INSERT INTO users (id, password) VALUES (?, ?)", [
                id,
                hashedPassword,
            ]);

        const tokens = generateTokens(id);

        res.status(201).json(tokens);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
});

router.post("/signin", async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res
            .status(400)
            .json({ error: ERROR_MESSAGES.ID_PASSWORD_REQUIRED });
    }

    try {
        const [users] = await db
            .getPool()
            .execute("SELECT * FROM users WHERE id = ?", [id]);

        if (users.length === 0) {
            return res
                .status(401)
                .json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        const tokens = generateTokens(id);

        res.json(tokens);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
});

router.post("/signin/new_token", async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: ERROR_MESSAGES.TOKEN_REQUIRED });
    }

    try {
        const decoded = jwt.verify(refreshToken, config.JWT.REFRESH_SECRET);

        const [rows] = await db
            .getPool()
            .execute("SELECT * FROM blocked_tokens WHERE token = ?", [
                refreshToken,
            ]);

        if (rows.length > 0) return res.sendStatus(403);

        const tokens = generateTokens(decoded.userId);

        res.json(tokens);
    } catch (err) {
        if (err.name === ERROR_MESSAGES.ERR_TOKEN_EXPIRED) {
            return res
                .status(401)
                .json({ error: ERROR_MESSAGES.TOKEN_EXPIRED });
        }
        return res.sendStatus(403);
    }
});

module.exports = router;
