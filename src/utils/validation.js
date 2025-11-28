const APP_CONSTANTS = require("../constants");

const validateDate = (dateString) => {
    if (!APP_CONSTANTS.DATE_REGEX.test(dateString)) {
        return false;
    }

    const date = new Date(dateString);
    return (
        date instanceof Date &&
        !isNaN(date) &&
        dateString === date.toISOString().split("T")[0]
    );
};

const validateDateRange = (dateParam) => {
    if (!dateParam) return { isValid: true };

    const dates = dateParam.split(",");

    if (dates.length === 1) {
        if (!validateDate(dates[0])) {
            return {
                isValid: false,
                message: "Invalid date format. Use YYYY-MM-DD",
            };
        }
        return {
            isValid: true,
            startDate: dates[0],
            endDate: dates[0],
        };
    }

    if (dates.length === 2) {
        if (!validateDate(dates[0]) || !validateDate(dates[1])) {
            return {
                isValid: false,
                message: "Invalid date format. Use YYYY-MM-DD,YYYY-MM-DD",
            };
        }

        const startDate = new Date(dates[0]);
        const endDate = new Date(dates[1]);

        if (startDate > endDate) {
            return {
                isValid: false,
                message: "Start date must be before or equal to end date",
            };
        }

        return {
            isValid: true,
            startDate: dates[0],
            endDate: dates[1],
        };
    }

    return {
        isValid: false,
        message: "Invalid date parameter format",
    };
};

const validateStatus = (status) => {
    if (!status) return { isValid: true };

    const statusNum = parseInt(status);
    if (
        statusNum !== APP_CONSTANTS.LESSON_STATUS.NOT_CONDUCTED &&
        statusNum !== APP_CONSTANTS.LESSON_STATUS.CONDUCTED
    ) {
        return {
            isValid: false,
            message: "Status must be 0 (not conducted) or 1 (conducted)",
        };
    }

    return {
        isValid: true,
        status: statusNum,
    };
};

const validateTeacherIds = (teacherIds) => {
    if (!teacherIds) return { isValid: true };

    const ids = teacherIds.split(",");
    const validIds = [];

    for (const id of ids) {
        const numId = parseInt(id.trim());
        if (isNaN(numId) || numId <= 0) {
            return {
                isValid: false,
                message: "Teacher IDs must be positive integers",
            };
        }
        validIds.push(numId);
    }

    return {
        isValid: true,
        teacherIds: validIds,
    };
};

const validateStudentsCount = (studentsCount) => {
    if (!studentsCount) return { isValid: true };

    const counts = studentsCount.split(",");

    if (counts.length === 1) {
        const count = parseInt(counts[0]);
        if (isNaN(count) || count < 0) {
            return {
                isValid: false,
                message: "Students count must be a non-negative integer",
            };
        }
        return {
            isValid: true,
            minCount: count,
            maxCount: count,
        };
    }

    if (counts.length === 2) {
        const minCount = parseInt(counts[0]);
        const maxCount = parseInt(counts[1]);

        if (
            isNaN(minCount) ||
            isNaN(maxCount) ||
            minCount < 0 ||
            maxCount < 0
        ) {
            return {
                isValid: false,
                message: "Students count range must be non-negative integers",
            };
        }

        if (minCount > maxCount) {
            return {
                isValid: false,
                message:
                    "Minimum count must be less than or equal to maximum count",
            };
        }

        return {
            isValid: true,
            minCount,
            maxCount,
        };
    }

    return {
        isValid: false,
        message: "Invalid students count format",
    };
};

module.exports = {
    validateDateRange,
    validateStatus,
    validateTeacherIds,
    validateStudentsCount,
};
