const HttpClient = require("../../src/utils/httpClient");
const axios = require("axios");
const constants = require("../../src/config/constants");

// Mock axios
jest.mock("axios");

describe("HttpClient", () => {
    let httpClient;
    let mockDomain;
    let mockOAuthService;
    let mockTokenManager;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDomain = "test.amocrm.ru";
        mockOAuthService = {
            getAccessToken: jest.fn(),
        };
        mockTokenManager = {
            loadTokens: jest.fn(),
        };

        httpClient = new HttpClient(
            mockDomain,
            mockOAuthService,
            mockTokenManager
        );
    });

    describe("constructor", () => {
        it("should initialize with correct base URL", () => {
            expect(httpClient.baseUrl).toBe(
                `https://${mockDomain}${constants.API_PATHS.API_VERSION}`
            );
        });
    });

    describe("buildRequestConfig", () => {
        it("should build config with access token", () => {
            const accessToken = "test-token";
            const method = "GET";
            const endpoint = "/test";

            const config = httpClient.buildRequestConfig(
                method,
                endpoint,
                null,
                accessToken
            );

            expect(config.method).toBe(method);
            expect(config.url).toBe(`${httpClient.baseUrl}${endpoint}`);
            expect(config.headers[constants.HEADERS.AUTHORIZATION]).toBe(
                `Bearer ${accessToken}`
            );
            expect(config.headers[constants.HEADERS.CONTENT_TYPE]).toBe(
                constants.HEADERS.CONTENT_TYPE_JSON
            );
        });

        it("should include data when provided", () => {
            const accessToken = "test-token";
            const method = "POST";
            const endpoint = "/test";
            const data = { test: "data" };

            const config = httpClient.buildRequestConfig(
                method,
                endpoint,
                data,
                accessToken
            );

            expect(config.data).toEqual(data);
        });

        it("should not include data when not provided", () => {
            const accessToken = "test-token";
            const method = "GET";
            const endpoint = "/test";

            const config = httpClient.buildRequestConfig(
                method,
                endpoint,
                null,
                accessToken
            );

            expect(config.data).toBeUndefined();
        });
    });

    describe("isAuthError", () => {
        it("should return true for 401 error", () => {
            const error = {
                response: { status: constants.HTTP_STATUS.UNAUTHORIZED },
            };

            const result = httpClient.isAuthError(error);

            expect(result).toBe(true);
        });

        it("should return true for 403 error", () => {
            const error = {
                response: { status: constants.HTTP_STATUS.FORBIDDEN },
            };

            const result = httpClient.isAuthError(error);

            expect(result).toBe(true);
        });

        it("should return false for other errors", () => {
            const error = {
                response: { status: constants.HTTP_STATUS.BAD_REQUEST },
            };

            const result = httpClient.isAuthError(error);

            expect(result).toBe(false);
        });

        it("should return false for error without response", () => {
            const error = { message: "Network error" };

            const result = httpClient.isAuthError(error);

            expect(result).toBe(false);
        });
    });

    describe("request", () => {
        it("should make successful request", async () => {
            const tokens = { accessToken: "test-token" };
            const mockResponse = { data: "success" };

            mockTokenManager.loadTokens.mockReturnValue(tokens);
            mockOAuthService.getAccessToken.mockResolvedValue("access-token");
            axios.mockResolvedValue(mockResponse);

            const result = await httpClient.request("GET", "/test");

            expect(result).toBe("success");
            expect(mockOAuthService.getAccessToken).toHaveBeenCalledWith(
                tokens
            );
            expect(axios).toHaveBeenCalledWith({
                method: "GET",
                url: `${httpClient.baseUrl}/test`,
                headers: {
                    [constants.HEADERS.AUTHORIZATION]: "Bearer access-token",
                    [constants.HEADERS.CONTENT_TYPE]:
                        constants.HEADERS.CONTENT_TYPE_JSON,
                },
            });
        });

        it("should include data in request when provided", async () => {
            const tokens = { accessToken: "test-token" };
            const mockResponse = { data: "success" };
            const requestData = { test: "data" };

            mockTokenManager.loadTokens.mockReturnValue(tokens);
            mockOAuthService.getAccessToken.mockResolvedValue("access-token");
            axios.mockResolvedValue(mockResponse);

            await httpClient.request("POST", "/test", requestData);

            expect(axios).toHaveBeenCalledWith({
                method: "POST",
                url: `${httpClient.baseUrl}/test`,
                headers: {
                    [constants.HEADERS.AUTHORIZATION]: "Bearer access-token",
                    [constants.HEADERS.CONTENT_TYPE]:
                        constants.HEADERS.CONTENT_TYPE_JSON,
                },
                data: requestData,
            });
        });

        it("should retry with new token on auth error", async () => {
            const tokens = { accessToken: "test-token" };
            const authError = {
                response: { status: constants.HTTP_STATUS.UNAUTHORIZED },
            };
            const mockResponse = { data: "success" };

            mockTokenManager.loadTokens.mockReturnValue(tokens);
            mockOAuthService.getAccessToken
                .mockResolvedValueOnce("old-token")
                .mockResolvedValueOnce("new-token");
            axios
                .mockRejectedValueOnce(authError)
                .mockResolvedValueOnce(mockResponse);

            const result = await httpClient.request("GET", "/test");

            expect(result).toBe("success");
            expect(mockOAuthService.getAccessToken).toHaveBeenCalledTimes(2);
            expect(axios).toHaveBeenCalledTimes(2);
        });

        it("should throw error on non-auth errors", async () => {
            const tokens = { accessToken: "test-token" };
            const networkError = new Error("Network error");

            mockTokenManager.loadTokens.mockReturnValue(tokens);
            mockOAuthService.getAccessToken.mockResolvedValue("access-token");
            axios.mockRejectedValue(networkError);

            await expect(httpClient.request("GET", "/test")).rejects.toEqual(
                networkError
            );
        });
    });

    describe("retryWithNewToken", () => {
        it("should retry request with new token", async () => {
            const tokens = { accessToken: "test-token" };
            const mockResponse = { data: "success" };

            mockTokenManager.loadTokens.mockReturnValue(tokens);
            mockOAuthService.getAccessToken.mockResolvedValue("new-token");
            axios.mockResolvedValue(mockResponse);

            const result = await httpClient.retryWithNewToken(
                "GET",
                "/test",
                null
            );

            expect(result).toBe("success");
            expect(mockOAuthService.getAccessToken).toHaveBeenCalledWith(
                tokens
            );
            expect(axios).toHaveBeenCalledWith({
                method: "GET",
                url: `${httpClient.baseUrl}/test`,
                headers: {
                    [constants.HEADERS.AUTHORIZATION]: "Bearer new-token",
                    [constants.HEADERS.CONTENT_TYPE]:
                        constants.HEADERS.CONTENT_TYPE_JSON,
                },
            });
        });

        it("should include data in retry request", async () => {
            const tokens = { accessToken: "test-token" };
            const mockResponse = { data: "success" };
            const requestData = { test: "data" };

            mockTokenManager.loadTokens.mockReturnValue(tokens);
            mockOAuthService.getAccessToken.mockResolvedValue("new-token");
            axios.mockResolvedValue(mockResponse);

            await httpClient.retryWithNewToken("POST", "/test", requestData);

            expect(axios).toHaveBeenCalledWith({
                method: "POST",
                url: `${httpClient.baseUrl}/test`,
                headers: {
                    [constants.HEADERS.AUTHORIZATION]: "Bearer new-token",
                    [constants.HEADERS.CONTENT_TYPE]:
                        constants.HEADERS.CONTENT_TYPE_JSON,
                },
                data: requestData,
            });
        });
    });
});
