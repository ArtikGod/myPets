const { errorHandler } = require("../middleware/errorHandler");
const { HTTP_STATUS } = require("../shared/constants");
const multer = require("multer");

describe("Error Handler Middleware", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        console.error = jest.fn();
    });

    test("should handle MulterError LIMIT_FILE_SIZE", () => {
        const error = new multer.MulterError("LIMIT_FILE_SIZE");
        error.code = "LIMIT_FILE_SIZE";

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "File size too large",
        });
    });

    test("should handle other MulterError", () => {
        const error = new multer.MulterError("LIMIT_FIELD_COUNT");
        error.code = "LIMIT_FIELD_COUNT";

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "File upload error",
        });
    });

    test("should handle invalid file type error", () => {
        const error = new Error("Invalid file type");

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Invalid file type",
        });
    });

    test("should handle generic errors", () => {
        const error = new Error("Some generic error");

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
        expect(mockRes.json).toHaveBeenCalledWith({
            error: "Internal server error",
        });
    });

    test("should log error stack", () => {
        const error = new Error("Test error");
        error.stack = "Error stack trace";

        errorHandler(error, mockReq, mockRes, mockNext);

        expect(console.error).toHaveBeenCalledWith(
            "An error occurred",
            "Error stack trace"
        );
    });
});
