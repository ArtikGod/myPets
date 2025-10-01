const { ERROR_MESSAGES, VALIDATION } = require("../shared/constants");

class ValidationService {
    static isValidEmail(email) {
        return VALIDATION.EMAIL_REGEX.test(email);
    }

    static isValidPhone(phone) {
        return VALIDATION.PHONE_REGEX.test(phone.replace(VALIDATION.PHONE_CLEANUP_REGEX, ""));
    }

    static validateUserId(id) {
        if (!id || typeof id !== "string") {
            return {
                isValid: false,
                error: ERROR_MESSAGES.ID_PASSWORD_REQUIRED,
            };
        }

        const trimmedId = id.trim();

        if (trimmedId.length === 0) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.ID_PASSWORD_REQUIRED,
            };
        }

        const isEmail = this.isValidEmail(trimmedId);
        const isPhone = this.isValidPhone(trimmedId);

        if (!isEmail && !isPhone) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.INVALID_ID_FORMAT,
            };
        }

        return {
            isValid: true,
            normalizedId: trimmedId,
            type: isEmail ? "email" : "phone",
        };
    }

    static validatePassword(password) {
        if (!password || typeof password !== "string") {
            return {
                isValid: false,
                error: ERROR_MESSAGES.ID_PASSWORD_REQUIRED,
            };
        }

        if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
            };
        }

        if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.PASSWORD_TOO_LONG,
            };
        }

        const hasLetter = VALIDATION.PASSWORD_LETTER_REGEX.test(password);
        const hasNumber = VALIDATION.PASSWORD_NUMBER_REGEX.test(password);

        if (!hasLetter || !hasNumber) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.PASSWORD_WEAK,
            };
        }

        return { isValid: true };
    }

    static validatePagination(page, listSize) {
        const errors = [];

        if (page !== undefined) {
            const pageNum = parseInt(page);
            if (isNaN(pageNum) || pageNum < 1) {
                errors.push(ERROR_MESSAGES.INVALID_PAGE);
            } else if (pageNum > VALIDATION.MAX_PAGE_NUMBER) {
                errors.push(ERROR_MESSAGES.PAGE_TOO_LARGE);
            }
        }

        if (listSize !== undefined) {
            const sizeNum = parseInt(listSize);
            if (isNaN(sizeNum) || sizeNum < 1) {
                errors.push(ERROR_MESSAGES.INVALID_LIST_SIZE);
            } else if (sizeNum > VALIDATION.MAX_LIST_SIZE) {
                errors.push(ERROR_MESSAGES.LIST_SIZE_TOO_LARGE);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
        };
    }

    static validateFileId(id) {
        if (!id) {
            return { isValid: false, error: ERROR_MESSAGES.FILE_ID_REQUIRED };
        }

        const fileId = parseInt(id);
        if (isNaN(fileId) || fileId < 1) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.INVALID_FILE_ID,
            };
        }

        return { isValid: true, fileId };
    }

    static validateFile(file, allowedTypes, maxSize) {
        if (!file) {
            return { isValid: false, error: ERROR_MESSAGES.NO_FILE_UPLOADED };
        }

        if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED.replace(
                    "{fileType}",
                    file.mimetype
                ).replace("{allowedTypes}", allowedTypes.join(", ")),
            };
        }

        if (maxSize && file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            return {
                isValid: false,
                error: ERROR_MESSAGES.FILE_SIZE_TOO_LARGE.replace(
                    "{maxSize}",
                    maxSizeMB
                ),
            };
        }

        if (!file.originalname || file.originalname.trim().length === 0) {
            return { isValid: false, error: ERROR_MESSAGES.INVALID_FILE_NAME };
        }

        const dangerousExtensions = VALIDATION.DANGEROUS_EXTENSIONS;
        const fileExtension = file.originalname
            .toLowerCase()
            .substring(file.originalname.lastIndexOf("."));

        if (dangerousExtensions.includes(fileExtension)) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.FILE_EXTENSION_DANGEROUS.replace(
                    "{extension}",
                    fileExtension
                ),
            };
        }

        return { isValid: true };
    }

    static validateRefreshToken(token) {
        if (!token || typeof token !== "string") {
            return { isValid: false, error: ERROR_MESSAGES.TOKEN_REQUIRED };
        }

        if (token.trim().length === 0) {
            return { isValid: false, error: ERROR_MESSAGES.TOKEN_REQUIRED };
        }

        const parts = token.split(".");
        if (parts.length !== 3) {
            return { isValid: false, error: ERROR_MESSAGES.INVALID_REFRESH };
        }

        return { isValid: true, token: token.trim() };
    }
}

module.exports = ValidationService;
