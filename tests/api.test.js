const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const authRoutes = require("../routes/auth");
const fileRoutes = require("../routes/files");
const userRoutes = require("../routes/user");
const { errorHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS } = require("../shared/constants");
const config = require("../config");

const mockExecute = jest.fn();
jest.mock("../db", () => ({
    getPool: jest.fn(() => ({
        execute: mockExecute,
    })),
    initialize: jest.fn(),
}));

jest.mock("../services/sessionService", () => ({
    createSession: jest.fn(),
    updateSessionRefreshToken: jest.fn(),
    checkSessionLimit: jest.fn(),
    getSessionByRefreshToken: jest.fn(),
    getSessionById: jest.fn(),
    deactivateSession: jest.fn(),
}));

jest.mock("fs", () => ({
    unlink: jest.fn(),
    unlinkSync: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(authRoutes);
app.use("/file", fileRoutes);
app.use(userRoutes);
app.use(errorHandler);

describe("API Endpoints", () => {
    const SessionService = require("../services/sessionService");

    beforeEach(() => {
        jest.clearAllMocks();
        mockExecute.mockClear();
    });

    describe("POST /signup", () => {
        test("should register new user successfully", async () => {
            mockExecute.mockResolvedValueOnce([[]]).mockResolvedValueOnce([]);

            SessionService.createSession.mockResolvedValue("session-123");
            SessionService.updateSessionRefreshToken.mockResolvedValue();

            const response = await request(app).post("/signup").send({
                id: "test@example.com",
                password: "password123",
            });

            expect(response.status).toBe(HTTP_STATUS.CREATED);
            expect(response.body).toHaveProperty("accessToken");
            expect(response.body).toHaveProperty("refreshToken");
            expect(response.body.message).toBe("User registered successfully");
        });

        test("should reject existing user", async () => {
            mockExecute.mockResolvedValueOnce([[{ id: "test@example.com" }]]);

            const response = await request(app).post("/signup").send({
                id: "test@example.com",
                password: "password123",
            });

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(response.body.error).toBe("User already exists");
        });

        test("should reject invalid email", async () => {
            const response = await request(app).post("/signup").send({
                id: "invalid-email",
                password: "password123",
            });

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });

        test("should reject weak password", async () => {
            const response = await request(app).post("/signup").send({
                id: "test@example.com",
                password: "weak",
            });

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
        });
    });

    describe("POST /signin", () => {
        test("should login user successfully", async () => {
            const hashedPassword = await bcrypt.hash("password123", 12);
            mockExecute.mockResolvedValueOnce([
                [
                    {
                        id: "test@example.com",
                        password: hashedPassword,
                    },
                ],
            ]);

            SessionService.checkSessionLimit.mockResolvedValue(1);
            SessionService.createSession.mockResolvedValue("session-123");
            SessionService.updateSessionRefreshToken.mockResolvedValue();

            const response = await request(app).post("/signin").send({
                id: "test@example.com",
                password: "password123",
            });

            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(response.body).toHaveProperty("accessToken");
            expect(response.body).toHaveProperty("refreshToken");
            expect(response.body.message).toBe("Logged in successfully");
        });

        test("should reject invalid credentials", async () => {
            mockExecute.mockResolvedValueOnce([[]]);

            const response = await request(app).post("/signin").send({
                id: "test@example.com",
                password: "wrongpassword",
            });

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
            expect(response.body.error).toBe("Invalid credentials");
        });
    });

    describe("POST /signin/new_token", () => {
        test("should refresh token successfully", async () => {
            const refreshToken = jwt.sign(
                { userId: "test@example.com" },
                config.JWT.REFRESH_SECRET
            );

            mockExecute.mockResolvedValueOnce([[]]);

            SessionService.getSessionByRefreshToken.mockResolvedValue({
                session_id: "session-123",
                user_id: "test@example.com",
            });
            SessionService.updateSessionRefreshToken.mockResolvedValue();

            const response = await request(app)
                .post("/signin/new_token")
                .send({ refreshToken });

            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(response.body).toHaveProperty("accessToken");
            expect(response.body).toHaveProperty("refreshToken");
        });

        test("should reject invalid refresh token", async () => {
            const response = await request(app)
                .post("/signin/new_token")
                .send({ refreshToken: "invalid.token.here" });

            expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
        });
    });

    describe("GET /info", () => {
        test("should return user info with valid token", async () => {
            const token = jwt.sign(
                { userId: "test@example.com" },
                config.JWT.SECRET
            );

            mockExecute.mockResolvedValueOnce([[]]);

            const response = await request(app)
                .get("/info")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(response.body.id).toBe("test@example.com");
        });

        test("should reject request without token", async () => {
            const response = await request(app).get("/info");

            expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        });
    });

    describe("GET /logout", () => {
        test("should logout user successfully", async () => {
            const token = jwt.sign(
                { userId: "test@example.com", sessionId: "session-123" },
                config.JWT.SECRET
            );

            mockExecute.mockResolvedValueOnce([[]]);

            SessionService.getSessionById.mockResolvedValue({
                session_id: "session-123",
                refresh_token: "refresh.token.here",
            });
            SessionService.deactivateSession.mockResolvedValue();

            const response = await request(app)
                .get("/logout")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(HTTP_STATUS.OK);
            expect(response.body.message).toBe("Logged out successfully");
        });
    });

    describe("File endpoints", () => {
        const validToken = jwt.sign(
            { userId: "test@example.com" },
            config.JWT.SECRET
        );

        describe("GET /file/list", () => {
            test("should return file list with pagination", async () => {
                const mockFiles = [{ id: 1, name: "test.pdf", size: 1024 }];
                mockExecute
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([mockFiles])
                    .mockResolvedValueOnce([[{ count: 1 }]]);

                const response = await request(app)
                    .get("/file/list")
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(HTTP_STATUS.OK);
                expect(response.body).toHaveProperty("files");
                expect(response.body).toHaveProperty("pagination");
            });

            test("should handle pagination parameters", async () => {
                mockExecute
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([[{ count: 0 }]]);

                const response = await request(app)
                    .get("/file/list?page=2&list_size=5")
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(HTTP_STATUS.OK);
                expect(response.body.pagination.page).toBe(2);
                expect(response.body.pagination.listSize).toBe(5);
            });
        });

        describe("GET /file/:id", () => {
            test("should return file info", async () => {
                const mockFile = {
                    id: 1,
                    name: "test.pdf",
                    size: 1024,
                };
                mockExecute
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([[mockFile]]);

                const response = await request(app)
                    .get("/file/1")
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(HTTP_STATUS.OK);
                expect(response.body).toEqual(mockFile);
            });

            test("should return 404 for non-existent file", async () => {
                mockExecute
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([[]]);

                const response = await request(app)
                    .get("/file/999")
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
            });
        });

        describe("DELETE /file/delete/:id", () => {
            test("should delete file successfully", async () => {
                mockExecute
                    .mockResolvedValueOnce([[]])
                    .mockResolvedValueOnce([[{ path: "test-file.pdf" }]])
                    .mockResolvedValueOnce([]);

                const fs = require("fs");
                fs.unlink = jest.fn();

                const response = await request(app)
                    .delete("/file/delete/1")
                    .set("Authorization", `Bearer ${validToken}`);

                expect(response.status).toBe(HTTP_STATUS.OK);
                expect(response.body.message).toBe("File deleted successfully");
            });
        });
    });
});
