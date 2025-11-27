const APP_CONSTANTS = {
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 50,
        MAX_PAGE_SIZE: 100,
    },

    FILTERS: {
        MAX_TEACHER_IDS: 50,
    },

    LESSON_STATUS: {
        NOT_CONDUCTED: 0,
        CONDUCTED: 1,
    },

    DATE_FORMAT: "YYYY-MM-DD",
    DATE_REGEX: /^\d{4}-\d{2}-\d{2}$/,

    CACHE: {
        PREFIX: "lessons",
        TTL_EMPTY_RESPONSE: 300,
    },

    ERROR_MESSAGES: {
        INVALID_DATE: "Invalid date format. Use YYYY-MM-DD",
        INVALID_DATE_PARAMETER_FORMAT: "Invalid date parameter format",
        INVALID_STATUS: "Status must be 0 (not conducted) or 1 (conducted)",
        TOO_MANY_TEACHERS: (max) =>
            `Too many teacherIds provided (max: ${max})`,
        INVALID_STUDENTS_COUNT: "Students count must be a non-negative integer",
        INVALID_STUDENTS_COUNT_RANGE:
            "Students count range must be non-negative integers",
        MIN_GREATER_THAN_MAX:
            "Minimum count must be less than or equal to maximum count",
        INVALID_STUDENTS_COUNT_FORMAT: "Invalid students count format",
        INVALID_PAGE_SIZE: "pageSize must be a positive integer",
        PAGE_SIZE_TOO_LARGE: (max) => `pageSize cannot exceed ${max}`,
        INVALID_LAST_ID: "lastId must be a valid integer",
    },
};

module.exports = APP_CONSTANTS;
