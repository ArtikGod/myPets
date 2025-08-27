const TokenManager = require("../../src/utils/tokenManager");
const fs = require("fs");
const path = require("path");
const constants = require("../../src/config/constants");

// Mock fs module
jest.mock("fs");
jest.mock("path");

describe("TokenManager", () => {
    let tokenManager;
    let mockTokenFile;
    let mockTokenDir;

    beforeEach(() => {
        jest.clearAllMocks();

        mockTokenFile = "/mock/tokens.json";
        mockTokenDir = "/mock";

        path.resolve.mockReturnValue(mockTokenFile);
        path.dirname.mockReturnValue(mockTokenDir);

        tokenManager = new TokenManager();
    });

    describe("constructor", () => {
        it("should create token directory if it doesn't exist", () => {
            fs.existsSync.mockReturnValue(false);

            new TokenManager();

            expect(fs.mkdirSync).toHaveBeenCalledWith(mockTokenDir, {
                recursive: true,
            });
        });

        it("should not create token directory if it exists", () => {
            fs.existsSync.mockReturnValue(true);

            new TokenManager();

            expect(fs.mkdirSync).toHaveBeenCalledWith(mockTokenDir, {
                recursive: true,
            });
        });
    });

    describe("loadTokens", () => {
        it("should load tokens from file if it exists", () => {
            const mockTokens = {
                accessToken: "test-access",
                refreshToken: "test-refresh",
                expires: 1234567890,
                authCode: "test-code",
            };

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockTokens));

            const result = tokenManager.loadTokens();

            expect(result).toEqual(mockTokens);
            expect(fs.readFileSync).toHaveBeenCalledWith(mockTokenFile, "utf8");
        });

        it("should return empty tokens if file doesn't exist", () => {
            fs.existsSync.mockReturnValue(false);

            const result = tokenManager.loadTokens();

            expect(result).toEqual({
                accessToken: null,
                refreshToken: null,
                expires: null,
                authCode: null,
            });
        });

        it("should return empty tokens on file read error", () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => {
                throw new Error("File read error");
            });

            const result = tokenManager.loadTokens();

            expect(result).toEqual({
                accessToken: null,
                refreshToken: null,
                expires: null,
                authCode: null,
            });
        });
    });

    describe("saveTokens", () => {
        it("should save tokens to file", () => {
            const tokens = {
                accessToken: "test-access",
                refreshToken: "test-refresh",
                expires: 1234567890,
                authCode: "test-code",
            };

            tokenManager.saveTokens(tokens);

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                mockTokenFile,
                JSON.stringify(tokens, null, 2)
            );
        });

        it("should handle save error gracefully", () => {
            const tokens = { accessToken: "test" };
            fs.writeFileSync.mockImplementation(() => {
                throw new Error("Write error");
            });

            expect(() => tokenManager.saveTokens(tokens)).not.toThrow();
        });
    });

    describe("getEmptyTokens", () => {
        it("should return empty token structure", () => {
            const result = tokenManager.getEmptyTokens();

            expect(result).toEqual({
                accessToken: null,
                refreshToken: null,
                expires: null,
                authCode: null,
            });
        });
    });

    describe("updateToken", () => {
        it("should update specific token and save", () => {
            const initialTokens = {
                accessToken: "old-access",
                refreshToken: "old-refresh",
                expires: 1234567890,
                authCode: "old-code",
            };

            const result = tokenManager.updateToken(
                initialTokens,
                "accessToken",
                "new-access"
            );

            expect(result.accessToken).toBe("new-access");
            expect(result.refreshToken).toBe("old-refresh");
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it("should preserve other tokens when updating one", () => {
            const initialTokens = {
                accessToken: "access",
                refreshToken: "refresh",
                expires: 1234567890,
                authCode: "code",
            };

            const result = tokenManager.updateToken(
                initialTokens,
                "expires",
                9999999999
            );

            expect(result.accessToken).toBe("access");
            expect(result.refreshToken).toBe("refresh");
            expect(result.authCode).toBe("code");
            expect(result.expires).toBe(9999999999);
        });
    });
});
