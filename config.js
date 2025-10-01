module.exports = {
    SERVER: {
        PORT: process.env.PORT || 3000,
        ENV: process.env.NODE_ENV || "development",
    },
    JWT: {
        SECRET: process.env.JWT_SECRET || "your_jwt_secret",
        ACCESS_EXPIRES: "10m",
        REFRESH_SECRET: process.env.REFRESH_SECRET || "your_refresh_secret",
        REFRESH_EXPIRES: "7d",
    },
    DB: {
        HOST: process.env.DB_HOST || "localhost",
        USER: process.env.DB_USER || "root",
        PASSWORD: process.env.DB_PASSWORD || "",
        DATABASE: process.env.DB_NAME || "file_storage",
        PORT: process.env.DB_PORT || 3306,
    },
    FILES: {
        UPLOAD_DIR: "uploads",
        MAX_FILE_SIZE: 5 * 1024 * 1024,
        ALLOWED_MIME_TYPES: [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "text/plain",
        ],
    },
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIST_SIZE: 10,
    },
    CORS: {
        WHITELIST: ["*"],
    },
    SESSION: {
        MAX_SESSIONS_PER_USER: process.env.MAX_SESSIONS_PER_USER || 10,
        DEFAULT_REFRESH_TOKEN: "",
        TIME_UNITS: {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        },
    },
};
