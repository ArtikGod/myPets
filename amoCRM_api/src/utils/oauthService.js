const axios = require("axios");
const constants = require("../config/constants");

class OAuthService {
    constructor(config, tokenManager) {
        this.domain = config.domain;
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.redirectUri = config.redirectUri;
        this.tokenManager = tokenManager;
    }

    async getAccessToken(tokens) {
        if (this.isTokenValid(tokens)) {
            return tokens.accessToken;
        }

        if (tokens.refreshToken) {
            return await this.refreshAccessToken(tokens);
        }

        if (tokens.authCode) {
            return await this.getNewAccessToken(tokens);
        }

        throw new Error(constants.ERROR_MESSAGES.NO_AUTH_CODE);
    }

    isTokenValid(tokens) {
        return !!(
            tokens.accessToken &&
            tokens.expires &&
            tokens.expires > Date.now()
        );
    }

    async getNewAccessToken(tokens) {
        try {
            const params = new URLSearchParams();
            params.append("client_id", this.clientId);
            params.append("client_secret", this.clientSecret);
            params.append(
                "grant_type",
                constants.TOKEN_PARAMS.GRANT_TYPE.AUTH_CODE
            );
            params.append("code", tokens.authCode);
            params.append("redirect_uri", this.redirectUri);

            const response = await axios.post(
                `https://${this.domain}${constants.API_PATHS.OAUTH_TOKEN}`,
                params.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const newTokens = {
                accessToken: response.data[constants.TOKEN_PARAMS.ACCESS_TOKEN],
                refreshToken:
                    response.data[constants.TOKEN_PARAMS.REFRESH_TOKEN],
                expires:
                    Date.now() +
                    response.data[constants.TOKEN_PARAMS.EXPIRES_IN] * 1000,
                authCode: tokens.authCode,
            };

            this.tokenManager.saveTokens(newTokens);
            return newTokens.accessToken;
        } catch (error) {
            console.error(
                "Error getting new access token:",
                error.response ? error.response.data : error.message
            );
            throw error;
        }
    }

    async refreshAccessToken(tokens) {
        try {
            const params = new URLSearchParams();
            params.append("client_id", this.clientId);
            params.append("client_secret", this.clientSecret);
            params.append(
                "grant_type",
                constants.TOKEN_PARAMS.GRANT_TYPE.REFRESH_TOKEN
            );
            params.append("refresh_token", tokens.refreshToken);
            params.append("redirect_uri", this.redirectUri);

            const response = await axios.post(
                `https://${this.domain}${constants.API_PATHS.OAUTH_TOKEN}`,
                params.toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const newTokens = {
                accessToken: response.data[constants.TOKEN_PARAMS.ACCESS_TOKEN],
                refreshToken:
                    response.data[constants.TOKEN_PARAMS.REFRESH_TOKEN],
                expires:
                    Date.now() +
                    response.data[constants.TOKEN_PARAMS.EXPIRES_IN] * 1000,
                authCode: tokens.authCode,
            };

            this.tokenManager.saveTokens(newTokens);
            return newTokens.accessToken;
        } catch (error) {
            console.error(
                "Error refreshing access token:",
                error.response ? error.response.data : error.message
            );

            if (tokens.authCode) {
                console.log(constants.ERROR_MESSAGES.TRYING_NEW_TOKEN);
                return await this.getNewAccessToken(tokens);
            }
            throw error;
        }
    }

    setAuthCode(code) {
        const tokens = this.tokenManager.loadTokens();
        const updatedTokens = this.tokenManager.updateToken(
            tokens,
            "authCode",
            code
        );
        return updatedTokens;
    }
}

module.exports = OAuthService;
