module.exports = {
    ERROR_MESSAGES: {
        ERR_TOKEN_EXPIRED: "TokenExpiredError",
        INVALID_CREDENTIALS: "Invalid credentials",
        USER_EXISTS: "User already exists",
        TOKEN_EXPIRED: "Token expired",
        REFRESH_EXPIRED: "Refresh token expired",
        INVALID_REFRESH: "Invalid refresh token",
        UNAUTHORIZED: "Unauthorized",
        ID_PASSWORD_REQUIRED: "ID and password are required",
        INVALID_ID_FORMAT: "ID must be a valid email address or phone number",
        PASSWORD_TOO_SHORT: "Password must be at least 8 characters long",
        PASSWORD_TOO_LONG: "Password must be no more than 128 characters long",
        PASSWORD_WEAK:
            "Password must contain at least one letter and one number",
        INVALID_PAGE: "Page must be a positive integer",
        PAGE_TOO_LARGE: "Page number is too large",
        INVALID_LIST_SIZE: "List size must be a positive integer",
        LIST_SIZE_TOO_LARGE: "List size cannot exceed 100",
        FILE_ID_REQUIRED: "File ID is required",
        INVALID_FILE_ID: "File ID must be a positive integer",
        INVALID_FILE_NAME: "File must have a valid name",
        FILE_TYPE_NOT_ALLOWED:
            "File type {fileType} is not allowed. Allowed types: {allowedTypes}",
        FILE_SIZE_TOO_LARGE:
            "File size exceeds maximum allowed size of {maxSize}MB",
        FILE_EXTENSION_DANGEROUS:
            "File extension {extension} is not allowed for security reasons",
        TOKEN_REQUIRED: "Token is required",
        DB_NOT_INITIALIZED: "Database not initialized",

        SESSION_CREATE_ERROR: "Error creating session",
        SESSION_UPDATE_REFRESH_TOKEN_ERROR:
            "Error updating session refresh token",
        SESSION_GET_BY_REFRESH_TOKEN_ERROR:
            "Error getting session by refresh token",
        SESSION_GET_BY_ID_ERROR: "Error getting session by id",
        SESSION_DEACTIVATE_ERROR: "Error deactivating session",
        SESSION_DEACTIVATE_ALL_ERROR: "Error deactivating all user sessions",
        SESSION_GET_ACTIVE_ERROR: "Error getting user active sessions",
        SESSION_CLEANUP_ERROR: "Error cleaning up expired sessions",
        SESSION_CHECK_LIMIT_ERROR: "Error checking session limit",
        INVALID_TIME_FORMAT: "Invalid time format",
        TOKEN_BLOCK_ERROR: "Error blocking token",
        INVALID_PAGINATION_PARAMS: "Invalid pagination parameters",
        GENERIC_ERROR: "An error occurred",

        FILE_NOT_FOUND: "File not found",
        INVALID_FILE_TYPE: "Invalid file type",
        FILE_TOO_LARGE: "File size too large",
        LIMIT_FILE_SIZE: "LIMIT_FILE_SIZE",
        FILE_UPLOAD_ERROR: "File upload error",
        FILE_DELETE_ERROR: "File delete error",
        FILE_UPDATE_ERROR: "File update error",
        NO_FILE_UPLOADED: "No file uploaded",

        BAD_REQUEST: "Bad request",
        INTERNAL_SERVER_ERROR: "Internal server error",
        NOT_FOUND: "Not found",
        FORBIDDEN: "Forbidden",
    },

    SUCCESS_MESSAGES: {
        USER_REGISTERED: "User registered successfully",
        LOGGED_IN: "Logged in successfully",
        TOKEN_REFRESHED: "Token refreshed successfully",
        LOGOUT_SUCCESS: "Logged out successfully",
        FILE_UPLOADED: "File uploaded successfully",
        FILE_DELETED: "File deleted successfully",
        FILE_UPDATED: "File updated successfully",
        AUTHORIZATION: "authorization",
        SESSIONS_CLEANED_UP: "Cleaned up {count} expired sessions",
        SERVER_RUNNING: "Server running on port {port}",
        TEST_MESSAGE: "Works!",
    },

    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },

    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^(\+7|8|7)?[0-9]{10}$/,
        PHONE_CLEANUP_REGEX: /[\s\-\(\)]/g,
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_MAX_LENGTH: 128,
        PASSWORD_LETTER_REGEX: /[a-zA-Zа-яА-Я]/,
        PASSWORD_NUMBER_REGEX: /\d/,
        MAX_PAGE_NUMBER: 10000,
        MAX_LIST_SIZE: 100,
        DANGEROUS_EXTENSIONS: [".exe", ".bat", ".cmd", ".scr", ".pif", ".com"],
        TIME_FORMAT_REGEX: /^(\d+)([smhd])$/,
    },

    SECURITY: {
        PASSWORD_SALT_ROUNDS: 12,
    },

    SQL_QUERIES: {
        SESSION: {
            INSERT_SESSION: `INSERT INTO user_sessions
                (user_id, session_id, refresh_token, device_info, ip_address, user_agent, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
            UPDATE_REFRESH_TOKEN:
                "UPDATE user_sessions SET refresh_token = ? WHERE session_id = ? AND is_active = TRUE",
            SELECT_BY_REFRESH_TOKEN: `SELECT * FROM user_sessions
                WHERE refresh_token = ? AND is_active = TRUE AND expires_at > NOW()`,
            SELECT_BY_SESSION_ID: `SELECT * FROM user_sessions
                WHERE session_id = ? AND is_active = TRUE AND expires_at > NOW()`,
            DEACTIVATE_SESSION:
                "UPDATE user_sessions SET is_active = FALSE WHERE session_id = ?",
            DEACTIVATE_ALL_USER_SESSIONS:
                "UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?",
            SELECT_USER_ACTIVE_SESSIONS: `SELECT session_id, device_info, ip_address, user_agent, created_at, expires_at
                FROM user_sessions
                WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()
                ORDER BY created_at DESC`,
            DELETE_EXPIRED_SESSIONS:
                "DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = FALSE",
            COUNT_USER_SESSIONS: `SELECT COUNT(*) as count FROM user_sessions
                WHERE user_id = ? AND is_active = TRUE AND expires_at > NOW()`,
            DEACTIVATE_OLDEST_SESSION: `UPDATE user_sessions
                SET is_active = FALSE
                WHERE user_id = ? AND is_active = TRUE
                ORDER BY created_at ASC
                LIMIT 1`,
        },
        AUTH: {
            SELECT_BLOCKED_TOKEN:
                "SELECT * FROM blocked_tokens WHERE token = ? AND token_type = ?",
            INSERT_BLOCKED_TOKEN:
                "INSERT INTO blocked_tokens (token, token_type, user_id, expires_at) VALUES (?, ?, ?, ?)",
            SELECT_USER_BY_ID: "SELECT * FROM users WHERE id = ?",
            INSERT_USER: "INSERT INTO users (id, password) VALUES (?, ?)",
        },
        FILES: {
            INSERT_FILE:
                "INSERT INTO files (name, extension, mime_type, size, upload_date, user_id, path) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
            SELECT_FILES_BY_USER:
                "SELECT id, name, extension, mime_type, size, upload_date FROM files WHERE user_id = ? LIMIT ? OFFSET ?",
            COUNT_FILES_BY_USER:
                "SELECT COUNT(*) as count FROM files WHERE user_id = ?",
            SELECT_FILE_PATH:
                "SELECT path FROM files WHERE id = ? AND user_id = ?",
            DELETE_FILE: "DELETE FROM files WHERE id = ? AND user_id = ?",
            SELECT_FILE_INFO:
                "SELECT id, name, extension, mime_type, size, upload_date FROM files WHERE id = ? AND user_id = ?",
            SELECT_FILE_FOR_DOWNLOAD:
                "SELECT name, path FROM files WHERE id = ? AND user_id = ?",
            UPDATE_FILE:
                "UPDATE files SET name = ?, extension = ?, mime_type = ?, size = ?, path = ?, upload_date = NOW() WHERE id = ? AND user_id = ?",
        },
    },

    TOKEN_TYPES: {
        ACCESS: "access",
        REFRESH: "refresh",
    },

    DEVICE: {
        UNKNOWN_DEVICE: "Unknown Device",
    },

    SERVER: {
        CORS_METHODS: ["GET", "POST", "PUT", "DELETE"],
        CORS_HEADERS: ["Content-Type", "Authorization"],
    },
};
