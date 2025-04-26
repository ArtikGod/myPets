const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("../db");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../shared/constants");

module.exports = {
    authenticateToken: async (req, res, next) => {
        const authHeader = req.headers[SUCCESS_MESSAGES.AUTHORIZATION];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) return res.sendStatus(401);

        try {
            const decoded = jwt.verify(token, config.JWT.SECRET);

            const [rows] = await db
                .getPool()
                .execute("SELECT * FROM blocked_tokens WHERE token = ?", [
                    token,
                ]);

            if (rows.length > 0) return res.sendStatus(403);

            req.user = decoded;
            next();
        } catch (err) {
            if (err.name === ERROR_MESSAGES.ERR_TOKEN_EXPIRED) {
                return res
                    .status(401)
                    .json({ error: ERROR_MESSAGES.TOKEN_EXPIRED });
            }
            return res.sendStatus(403);
        }
    },
    generateTokens: (userId) => {
        const accessToken = jwt.sign({ userId }, config.JWT.SECRET, {
            expiresIn: config.JWT.ACCESS_EXPIRES,
        });
        const refreshToken = jwt.sign({ userId }, config.JWT.REFRESH_SECRET, {
            expiresIn: config.JWT.REFRESH_EXPIRES,
        });
        return { accessToken, refreshToken };
    },
};
