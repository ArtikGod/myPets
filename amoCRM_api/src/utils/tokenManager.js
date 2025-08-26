const fs = require("fs");
const path = require("path");
const constants = require("../config/constants");

class TokenManager {
    constructor() {
        this.tokenFile = path.resolve(__dirname, constants.FILE_PATHS.TOKENS);
        this.ensureTokenDirectory();
    }

    ensureTokenDirectory() {
        const tokenDir = path.dirname(this.tokenFile);
        if (!fs.existsSync(tokenDir)) {
            fs.mkdirSync(tokenDir, { recursive: true });
        }
    }

    loadTokens() {
        try {
            if (fs.existsSync(this.tokenFile)) {
                const data = fs.readFileSync(this.tokenFile, "utf8");
                return JSON.parse(data);
            }
            return this.getEmptyTokens();
        } catch (error) {
            console.error("Error loading tokens:", error.message);
            return this.getEmptyTokens();
        }
    }

    saveTokens(tokens) {
        try {
            fs.writeFileSync(this.tokenFile, JSON.stringify(tokens, null, 2));
        } catch (error) {
            console.error("Error saving tokens:", error.message);
        }
    }

    getEmptyTokens() {
        return {
            accessToken: null,
            refreshToken: null,
            expires: null,
            authCode: null,
        };
    }

    updateToken(tokens, key, value) {
        const updatedTokens = { ...tokens, [key]: value };
        this.saveTokens(updatedTokens);
        return updatedTokens;
    }
}

module.exports = TokenManager;
