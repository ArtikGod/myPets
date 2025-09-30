const jwt = require("jsonwebtoken");
const {
    generateTokens,
    extractDeviceInfo,
    blockToken,
} = require("../middleware/auth");
const config = require("../config");

const mockExecute = jest.fn();

jest.mock("../db", () => ({
    getPool: () => ({
        execute: mockExecute,
    }),
}));

describe("Auth Middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecute.mockClear();
    });

    describe("generateTokens", () => {
        test("should generate access and refresh tokens", () => {
            const userId = "test@example.com";
            const sessionId = "session-123";

            const tokens = generateTokens(userId, sessionId);

            expect(tokens).toHaveProperty("accessToken");
            expect(tokens).toHaveProperty("refreshToken");
            expect(typeof tokens.accessToken).toBe("string");
            expect(typeof tokens.refreshToken).toBe("string");
        });

        test("should include userId in token payload", () => {
            const userId = "test@example.com";
            const tokens = generateTokens(userId);

            const decoded = jwt.decode(tokens.accessToken);
            expect(decoded.userId).toBe(userId);
        });

        test("should include sessionId when provided", () => {
            const userId = "test@example.com";
            const sessionId = "session-123";
            const tokens = generateTokens(userId, sessionId);

            const decoded = jwt.decode(tokens.accessToken);
            expect(decoded.sessionId).toBe(sessionId);
        });

        test("should not include sessionId when not provided", () => {
            const userId = "test@example.com";
            const tokens = generateTokens(userId);

            const decoded = jwt.decode(tokens.accessToken);
            expect(decoded.sessionId).toBeUndefined();
        });
    });

    describe("extractDeviceInfo", () => {
        test("should extract device info from request", () => {
            const mockReq = {
                ip: "192.168.1.1",
                get: jest.fn((header) => {
                    if (header === "User-Agent") return "Mozilla/5.0";
                    if (header === "X-Device-Name") return "iPhone";
                    return null;
                }),
            };

            const deviceInfo = extractDeviceInfo(mockReq);

            expect(deviceInfo).toEqual({
                ip: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                deviceName: "iPhone",
            });
        });

        test("should handle missing headers", () => {
            const mockReq = {
                connection: {},
                socket: {},
                get: jest.fn(() => null),
            };

            const deviceInfo = extractDeviceInfo(mockReq);

            expect(deviceInfo).toEqual({
                ip: undefined,
                userAgent: "",
                deviceName: "Unknown Device",
            });
        });

        test("should use connection.remoteAddress as fallback", () => {
            const mockReq = {
                connection: { remoteAddress: "10.0.0.1" },
                get: jest.fn(() => null),
            };

            const deviceInfo = extractDeviceInfo(mockReq);

            expect(deviceInfo.ip).toBe("10.0.0.1");
        });
    });

    describe("blockToken", () => {
        const db = require("../db");

        beforeEach(() => {
            jest.clearAllMocks();
        });

        test("should block access token", async () => {
            mockExecute.mockResolvedValue([]);

            const token = "test.token.here";
            const userId = "user123";

            await blockToken(token, "access", userId);

            expect(mockExecute).toHaveBeenCalledWith(
                "INSERT INTO blocked_tokens (token, token_type, user_id, expires_at) VALUES (?, ?, ?, ?)",
                [token, "access", userId, null]
            );
        });

        test("should block refresh token", async () => {
            mockExecute.mockResolvedValue([]);

            const token = "refresh.token.here";
            const userId = "user123";

            await blockToken(token, "refresh", userId);

            expect(mockExecute).toHaveBeenCalledWith(
                "INSERT INTO blocked_tokens (token, token_type, user_id, expires_at) VALUES (?, ?, ?, ?)",
                [token, "refresh", userId, null]
            );
        });

        test("should extract expiration from valid JWT", async () => {
            mockExecute.mockResolvedValue([]);

            const payload = {
                userId: "test",
                exp: Math.floor(Date.now() / 1000) + 3600,
            };
            const token = jwt.sign(payload, config.JWT.SECRET);

            await blockToken(token, "access", "user123");

            expect(mockExecute).toHaveBeenCalled();
            const callArgs = mockExecute.mock.calls[0][1];
            expect(callArgs[3]).toBeInstanceOf(Date);
        });

        test("should handle invalid JWT gracefully", async () => {
            mockExecute.mockResolvedValue([]);

            const invalidToken = "invalid.token";

            await blockToken(invalidToken, "access", "user123");

            expect(mockExecute).toHaveBeenCalledWith(
                "INSERT INTO blocked_tokens (token, token_type, user_id, expires_at) VALUES (?, ?, ?, ?)",
                [invalidToken, "access", "user123", null]
            );
        });

        test("should throw error on database failure", async () => {
            mockExecute.mockRejectedValue(new Error("DB Error"));

            await expect(
                blockToken("token", "access", "user123")
            ).rejects.toThrow("DB Error");
        });
    });
});
