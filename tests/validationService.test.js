const ValidationService = require("../services/validationService");

describe("ValidationService", () => {
    describe("isValidEmail", () => {
        test("should validate correct email", () => {
            expect(ValidationService.isValidEmail("test@example.com")).toBe(
                true
            );
            expect(
                ValidationService.isValidEmail("user.name@domain.co.uk")
            ).toBe(true);
        });

        test("should reject invalid email", () => {
            expect(ValidationService.isValidEmail("invalid-email")).toBe(false);
            expect(ValidationService.isValidEmail("@domain.com")).toBe(false);
            expect(ValidationService.isValidEmail("user@")).toBe(false);
        });
    });

    describe("isValidPhone", () => {
        test("should validate correct phone numbers", () => {
            expect(ValidationService.isValidPhone("+79001234567")).toBe(true);
            expect(ValidationService.isValidPhone("89001234567")).toBe(true);
            expect(ValidationService.isValidPhone("79001234567")).toBe(true);
        });

        test("should reject invalid phone numbers", () => {
            expect(ValidationService.isValidPhone("123")).toBe(false);
            expect(ValidationService.isValidPhone("+7900123456")).toBe(false);
            expect(ValidationService.isValidPhone("abc1234567")).toBe(false);
        });
    });

    describe("validateUserId", () => {
        test("should validate correct email ID", () => {
            const result = ValidationService.validateUserId("test@example.com");
            expect(result.isValid).toBe(true);
            expect(result.normalizedId).toBe("test@example.com");
            expect(result.type).toBe("email");
        });

        test("should validate correct phone ID", () => {
            const result = ValidationService.validateUserId("+79001234567");
            expect(result.isValid).toBe(true);
            expect(result.normalizedId).toBe("+79001234567");
            expect(result.type).toBe("phone");
        });

        test("should reject invalid ID", () => {
            const result = ValidationService.validateUserId("invalid");
            expect(result.isValid).toBe(false);
            expect(result.error).toBeDefined();
        });

        test("should reject empty ID", () => {
            const result = ValidationService.validateUserId("");
            expect(result.isValid).toBe(false);
        });
    });

    describe("validatePassword", () => {
        test("should validate correct password", () => {
            const result = ValidationService.validatePassword("password123");
            expect(result.isValid).toBe(true);
        });

        test("should reject short password", () => {
            const result = ValidationService.validatePassword("pass1");
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("8 characters");
        });

        test("should reject password without number", () => {
            const result = ValidationService.validatePassword("password");
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("number");
        });

        test("should reject password without letter", () => {
            const result = ValidationService.validatePassword("12345678");
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("letter");
        });
    });

    describe("validatePagination", () => {
        test("should validate correct pagination", () => {
            const result = ValidationService.validatePagination("1", "10");
            expect(result.isValid).toBe(true);
        });

        test("should reject invalid page", () => {
            const result = ValidationService.validatePagination("0", "10");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Page must be a positive integer");
        });

        test("should reject invalid list size", () => {
            const result = ValidationService.validatePagination("1", "0");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                "List size must be a positive integer"
            );
        });

        test("should reject too large list size", () => {
            const result = ValidationService.validatePagination("1", "101");
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("List size cannot exceed 100");
        });
    });

    describe("validateFileId", () => {
        test("should validate correct file ID", () => {
            const result = ValidationService.validateFileId("123");
            expect(result.isValid).toBe(true);
            expect(result.fileId).toBe(123);
        });

        test("should reject invalid file ID", () => {
            const result = ValidationService.validateFileId("abc");
            expect(result.isValid).toBe(false);
        });

        test("should reject negative file ID", () => {
            const result = ValidationService.validateFileId("-1");
            expect(result.isValid).toBe(false);
        });
    });

    describe("validateFile", () => {
        const mockFile = {
            originalname: "test.pdf",
            mimetype: "application/pdf",
            size: 1024,
        };

        test("should validate correct file", () => {
            const result = ValidationService.validateFile(
                mockFile,
                ["application/pdf"],
                2048
            );
            expect(result.isValid).toBe(true);
        });

        test("should reject file with wrong type", () => {
            const result = ValidationService.validateFile(
                mockFile,
                ["image/jpeg"],
                2048
            );
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("not allowed");
        });

        test("should reject file too large", () => {
            const result = ValidationService.validateFile(
                mockFile,
                ["application/pdf"],
                512
            );
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("exceeds maximum");
        });

        test("should reject dangerous file extension", () => {
            const dangerousFile = {
                ...mockFile,
                originalname: "virus.exe",
            };
            const result = ValidationService.validateFile(
                dangerousFile,
                null,
                null
            );
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("not allowed for security");
        });
    });

    describe("validateRefreshToken", () => {
        test("should validate correct JWT format", () => {
            const token = "header.payload.signature";
            const result = ValidationService.validateRefreshToken(token);
            expect(result.isValid).toBe(true);
            expect(result.token).toBe(token);
        });

        test("should reject invalid JWT format", () => {
            const result =
                ValidationService.validateRefreshToken("invalid.token");
            expect(result.isValid).toBe(false);
        });

        test("should reject empty token", () => {
            const result = ValidationService.validateRefreshToken("");
            expect(result.isValid).toBe(false);
        });
    });
});
