const axios = require("axios");
const constants = require("../config/constants");

class HttpClient {
    constructor(domain, oauthService, tokenManager) {
        this.baseUrl = `https://${domain}${constants.API_PATHS.API_VERSION}`;
        this.oauthService = oauthService;
        this.tokenManager = tokenManager;
    }

    async request(method, endpoint, data = null) {
        try {
            const tokens = this.tokenManager.loadTokens();
            const accessToken = await this.oauthService.getAccessToken(tokens);

            const config = this.buildRequestConfig(
                method,
                endpoint,
                data,
                accessToken
            );
            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (this.isAuthError(error)) {
                return await this.retryWithNewToken(method, endpoint, data);
            }

            console.error(
                "API request error:",
                error.response ? error.response.data : error.message
            );
            throw error;
        }
    }

    buildRequestConfig(method, endpoint, data, accessToken) {
        const config = {
            method,
            url: `${this.baseUrl}${endpoint}`,
            headers: {
                [constants.HEADERS.AUTHORIZATION]: `Bearer ${accessToken}`,
                [constants.HEADERS.CONTENT_TYPE]:
                    constants.HEADERS.CONTENT_TYPE_JSON,
            },
        };

        if (data) {
            config.data = data;
        }

        return config;
    }

    isAuthError(error) {
        return !!(
            error.response &&
            (error.response.status === constants.HTTP_STATUS.UNAUTHORIZED ||
                error.response.status === constants.HTTP_STATUS.FORBIDDEN)
        );
    }

    async retryWithNewToken(method, endpoint, data) {
        const tokens = this.tokenManager.loadTokens();
        const accessToken = await this.oauthService.getAccessToken(tokens);

        const config = this.buildRequestConfig(
            method,
            endpoint,
            data,
            accessToken
        );
        const response = await axios(config);
        return response.data;
    }
}

module.exports = HttpClient;
