const SessionService = require("../services/sessionService");

const mockExecute = jest.fn();
jest.mock("../db", () => ({
    getPool: jest.fn(() => ({
        execute: mockExecute,
    })),
}));

describe("SessionService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExecute.mockClear();
    });

    describe("createSession", () => {
        test("should create new session", async () => {
            mockExecute.mockResolvedValue([]);

            const userId = "test@example.com";
            const deviceInfo = {
                ip: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                deviceName: "iPhone",
            };

            const sessionId = await SessionService.createSession(
                userId,
                deviceInfo
            );

            expect(typeof sessionId).toBe("string");
            expect(mockExecute).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO user_sessions"),
                expect.arrayContaining([userId, sessionId])
            );
        });

        test("should handle empty device info", async () => {
            mockExecute.mockResolvedValue([]);

            const sessionId = await SessionService.createSession(
                "user@test.com"
            );

            expect(typeof sessionId).toBe("string");
            expect(mockExecute).toHaveBeenCalled();
        });
    });

    describe("updateSessionRefreshToken", () => {
        test("should update refresh token", async () => {
            mockExecute.mockResolvedValue([]);

            const sessionId = "session-123";
            const refreshToken = "refresh.token.here";

            await SessionService.updateSessionRefreshToken(
                sessionId,
                refreshToken
            );

            expect(mockExecute).toHaveBeenCalledWith(
                "UPDATE user_sessions SET refresh_token = ? WHERE session_id = ? AND is_active = TRUE",
                [refreshToken, sessionId]
            );
        });
    });

    describe("getSessionByRefreshToken", () => {
        test("should return session for valid refresh token", async () => {
            const mockSession = {
                id: 1,
                user_id: "test@example.com",
                session_id: "session-123",
                refresh_token: "refresh.token.here",
            };
            mockExecute.mockResolvedValue([[mockSession]]);

            const result = await SessionService.getSessionByRefreshToken(
                "refresh.token.here"
            );

            expect(result).toEqual(mockSession);
            expect(mockExecute).toHaveBeenCalledWith(
                expect.stringContaining(
                    "WHERE refresh_token = ? AND is_active = TRUE"
                ),
                ["refresh.token.here"]
            );
        });

        test("should return null for invalid refresh token", async () => {
            mockExecute.mockResolvedValue([[]]);

            const result = await SessionService.getSessionByRefreshToken(
                "invalid.token"
            );

            expect(result).toBeNull();
        });
    });

    describe("getSessionById", () => {
        test("should return session for valid session ID", async () => {
            const mockSession = {
                id: 1,
                user_id: "test@example.com",
                session_id: "session-123",
            };
            mockExecute.mockResolvedValue([[mockSession]]);

            const result = await SessionService.getSessionById("session-123");

            expect(result).toEqual(mockSession);
            expect(mockExecute).toHaveBeenCalledWith(
                expect.stringContaining(
                    "WHERE session_id = ? AND is_active = TRUE"
                ),
                ["session-123"]
            );
        });

        test("should return null for invalid session ID", async () => {
            mockExecute.mockResolvedValue([[]]);

            const result = await SessionService.getSessionById(
                "invalid-session"
            );

            expect(result).toBeNull();
        });
    });

    describe("deactivateSession", () => {
        test("should deactivate session", async () => {
            mockExecute.mockResolvedValue([]);

            await SessionService.deactivateSession("session-123");

            expect(mockExecute).toHaveBeenCalledWith(
                "UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?",
                ["session-123"]
            );
        });
    });

    describe("deactivateAllUserSessions", () => {
        test("should deactivate all user sessions", async () => {
            mockExecute.mockResolvedValue([]);

            await SessionService.deactivateAllUserSessions("user@test.com");

            expect(mockExecute).toHaveBeenCalledWith(
                "UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?",
                ["user@test.com"]
            );
        });
    });

    describe("getUserActiveSessions", () => {
        test("should return active sessions for user", async () => {
            const mockSessions = [
                { session_id: "session-1", created_at: new Date() },
                { session_id: "session-2", created_at: new Date() },
            ];
            mockExecute.mockResolvedValue([mockSessions]);

            const result = await SessionService.getUserActiveSessions(
                "user@test.com"
            );

            expect(result).toEqual(mockSessions);
            expect(mockExecute).toHaveBeenCalledWith(
                expect.stringContaining(
                    "WHERE user_id = ? AND is_active = TRUE"
                ),
                ["user@test.com"]
            );
        });
    });

    describe("cleanupExpiredSessions", () => {
        test("should cleanup expired sessions", async () => {
            mockExecute.mockResolvedValue([{ affectedRows: 5 }]);

            const result = await SessionService.cleanupExpiredSessions();

            expect(result).toBe(5);
            expect(mockExecute).toHaveBeenCalledWith(
                "DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = FALSE"
            );
        });
    });

    describe("checkSessionLimit", () => {
        test("should not deactivate when under limit", async () => {
            mockExecute.mockResolvedValueOnce([[{ count: 5 }]]);

            const result = await SessionService.checkSessionLimit(
                "user@test.com",
                10
            );

            expect(result).toBe(5);
            expect(mockExecute).toHaveBeenCalledTimes(1);
        });

        test("should deactivate oldest session when over limit", async () => {
            mockExecute
                .mockResolvedValueOnce([[{ count: 15 }]])
                .mockResolvedValueOnce([]);

            const result = await SessionService.checkSessionLimit(
                "user@test.com",
                10
            );

            expect(result).toBe(15);
            expect(mockExecute).toHaveBeenCalledTimes(2);
            expect(mockExecute).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("UPDATE user_sessions"),
                ["user@test.com"]
            );
        });
    });

    describe("parseTimeToMs", () => {
        test("should parse seconds", () => {
            expect(SessionService.parseTimeToMs("30s")).toBe(30000);
        });

        test("should parse minutes", () => {
            expect(SessionService.parseTimeToMs("10m")).toBe(600000);
        });

        test("should parse hours", () => {
            expect(SessionService.parseTimeToMs("2h")).toBe(7200000);
        });

        test("should parse days", () => {
            expect(SessionService.parseTimeToMs("7d")).toBe(604800000);
        });

        test("should throw error for invalid format", () => {
            expect(() => SessionService.parseTimeToMs("invalid")).toThrow(
                "Invalid time format"
            );
        });
    });
});
