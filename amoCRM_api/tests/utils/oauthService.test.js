const OAuthService = require("../../src/utils/oauthService");
const axios = require("axios");
const constants = require("../../src/config/constants");

// Mock axios
jest.mock("axios");

describe("OAuthService", () => {
    let oauthService;
    let mockConfig;
    let mockTokenManager;

    beforeEach(() => {
        jest.clearAllMocks();

        mockConfig = {
            domain: "test.amocrm.ru",
            clientId: "test-client-id",
            clientSecret: "test-client-secret",
            redirectUri: "http://localhost:3002/auth/callback",
        };

        mockTokenManager = {
            loadTokens: jest.fn(),
            saveTokens: jest.fn(),
            updateToken: jest.fn(),
        };

        oauthService = new OAuthService(mockConfig, mockTokenManager);
    });

    describe("constructor", () => {
        it("should initialize with config and token manager", () => {
            expect(oauthService.domain).toBe(mockConfig.domain);
            expect(oauthService.clientId).toBe(mockConfig.clientId);
            expect(oauthService.clientSecret).toBe(mockConfig.clientSecret);
            expect(oauthService.redirectUri).toBe(mockConfig.redirectUri);
            expect(oauthService.tokenManager).toBe(mockTokenManager);
        });
    });

    describe("isTokenValid", () => {
        it("should return true for valid token", () => {
            const tokens = {
                accessToken: "valid-token",
                expires: Date.now() + 3600000, // 1 hour from now
            };

            const result = oauthService.isTokenValid(tokens);

            expect(result).toBe(true);
        });

        it("should return false for expired token", () => {
            const tokens = {
                accessToken: "expired-token",
                expires: Date.now() - 3600000, // 1 hour ago
            };

            const result = oauthService.isTokenValid(tokens);

            expect(result).toBe(false);
        });

        it("should return false for missing token", () => {
            const tokens = {
                expires: Date.now() + 3600000,
            };

            const result = oauthService.isTokenValid(tokens);

            expect(result).toBe(false);
        });

        it("should return false for missing expires", () => {
            const tokens = {
                accessToken: "valid-token",
            };

            const result = oauthService.isTokenValid(tokens);

            expect(result).toBe(false);
        });
    });

    describe("getAccessToken", () => {
        it("should return existing valid token", async () => {
            const tokens = {
                accessToken: "valid-token",
                expires: Date.now() + 3600000,
            };

            const result = await oauthService.getAccessToken(tokens);

            expect(result).toBe("valid-token");
        });

        it("should refresh token when expired", async () => {
            const tokens = {
                accessToken: "expired-token",
                refreshToken: "refresh-token",
                expires: Date.now() - 3600000,
            };

            const mockResponse = {
                data: {
                    [constants.TOKEN_PARAMS.ACCESS_TOKEN]: "new-access-token",
                    [constants.TOKEN_PARAMS.REFRESH_TOKEN]: "new-refresh-token",
                    [constants.TOKEN_PARAMS.EXPIRES_IN]: 3600,
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await oauthService.getAccessToken(tokens);

            expect(result).toBe("new-access-token");
            expect(axios.post).toHaveBeenCalledWith(
                `https://${mockConfig.domain}${constants.API_PATHS.OAUTH_TOKEN}`,
                expect.stringContaining("grant_type=refresh_token"),
                expect.any(Object)
            );
        });

        it("should get new token when no refresh token", async () => {
            const tokens = {
                authCode: "auth-code",
            };

            const mockResponse = {
                data: {
                    [constants.TOKEN_PARAMS.ACCESS_TOKEN]: "new-access-token",
                    [constants.TOKEN_PARAMS.REFRESH_TOKEN]: "new-refresh-token",
                    [constants.TOKEN_PARAMS.EXPIRES_IN]: 3600,
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await oauthService.getAccessToken(tokens);

            expect(result).toBe("new-access-token");
            expect(axios.post).toHaveBeenCalledWith(
                `https://${mockConfig.domain}${constants.API_PATHS.OAUTH_TOKEN}`,
                expect.stringContaining("grant_type=authorization_code"),
                expect.any(Object)
            );
        });

        it("should throw error when no auth code available", async () => {
            const tokens = {};

            await expect(oauthService.getAccessToken(tokens)).rejects.toThrow(
                constants.ERROR_MESSAGES.NO_AUTH_CODE
            );
        });
    });

    describe("getNewAccessToken", () => {
        it("should exchange auth code for tokens", async () => {
            const tokens = { authCode: "test-auth-code" };

            const mockResponse = {
                data: {
                    [constants.TOKEN_PARAMS.ACCESS_TOKEN]: "new-access-token",
                    [constants.TOKEN_PARAMS.REFRESH_TOKEN]: "new-refresh-token",
                    [constants.TOKEN_PARAMS.EXPIRES_IN]: 3600,
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await oauthService.getNewAccessToken(tokens);

            expect(result).toBe("new-access-token");
            expect(mockTokenManager.saveTokens).toHaveBeenCalledWith({
                accessToken: "new-access-token",
                refreshToken: "new-refresh-token",
                expires: expect.any(Number),
                authCode: "test-auth-code",
            });
        });

        it("should handle API errors", async () => {
            const tokens = { authCode: "test-auth-code" };
            const mockError = {
                response: { data: "API Error" },
            };

            axios.post.mockRejectedValue(mockError);

            await expect(
                oauthService.getNewAccessToken(tokens)
            ).rejects.toEqual(mockError);
        });
    });

    describe("refreshAccessToken", () => {
        it("should refresh token successfully", async () => {
            const tokens = {
                refreshToken: "test-refresh-token",
                authCode: "test-auth-code",
            };

            const mockResponse = {
                data: {
                    [constants.TOKEN_PARAMS.ACCESS_TOKEN]:
                        "refreshed-access-token",
                    [constants.TOKEN_PARAMS.REFRESH_TOKEN]: "new-refresh-token",
                    [constants.TOKEN_PARAMS.EXPIRES_IN]: 3600,
                },
            };

            axios.post.mockResolvedValue(mockResponse);

            const result = await oauthService.refreshAccessToken(tokens);

            expect(result).toBe("refreshed-access-token");
            expect(mockTokenManager.saveTokens).toHaveBeenCalledWith({
                accessToken: "refreshed-access-token",
                refreshToken: "new-refresh-token",
                expires: expect.any(Number),
                authCode: "test-auth-code",
            });
        });

        it("should fallback to new token on refresh failure", async () => {
            const tokens = {
                refreshToken: "test-refresh-token",
                authCode: "test-auth-code",
            };

            const refreshError = {
                response: { data: "Refresh failed" },
            };

            const newTokenResponse = {
                data: {
                    [constants.TOKEN_PARAMS.ACCESS_TOKEN]: "new-access-token",
                    [constants.TOKEN_PARAMS.REFRESH_TOKEN]: "new-refresh-token",
                    [constants.TOKEN_PARAMS.EXPIRES_IN]: 3600,
                },
            };

            axios.post
                .mockRejectedValueOnce(refreshError)
                .mockResolvedValueOnce(newTokenResponse);

            const result = await oauthService.refreshAccessToken(tokens);

            expect(result).toBe("new-access-token");
            expect(axios.post).toHaveBeenCalledTimes(2);
        });

        it("should throw error when no auth code available for fallback", async () => {
            const tokens = {
                refreshToken: "test-refresh-token",
                // No authCode
            };

            const mockError = {
                response: { data: "Refresh failed" },
            };

            axios.post.mockRejectedValue(mockError);

            await expect(
                oauthService.refreshAccessToken(tokens)
            ).rejects.toEqual(mockError);
        });
    });

    describe("setAuthCode", () => {
        it("should update auth code in tokens", () => {
            const mockTokens = { accessToken: "old" };
            const newCode = "new-auth-code";

            mockTokenManager.loadTokens.mockReturnValue(mockTokens);
            mockTokenManager.updateToken.mockReturnValue({
                ...mockTokens,
                authCode: newCode,
            });

            const result = oauthService.setAuthCode(newCode);

            expect(mockTokenManager.loadTokens).toHaveBeenCalled();
            expect(mockTokenManager.updateToken).toHaveBeenCalledWith(
                mockTokens,
                "authCode",
                newCode
            );
            expect(result.authCode).toBe(newCode);
        });
    });
});
