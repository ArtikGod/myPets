const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);

    if (
        err.message.includes("Invalid") ||
        err.message.includes("format") ||
        err.message.includes("must be") ||
        err.message.includes("Too many") ||
        err.message.includes("pageSize cannot") ||
        err.message.includes("Status must") ||
        err.message.includes("teacherIds")
    ) {
        return res.status(400).json({
            error: "Validation Error",
            message: err.message,
        });
    }

    res.status(500).json({
        error: "Internal Server Error",
        message: "Something went wrong",
    });
};

module.exports = errorHandler;
