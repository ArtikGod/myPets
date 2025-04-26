const { ERROR_MESSAGES } = require("../shared/constants");

module.exports = {
    errorHandler: (err, req, res, next) => {
        console.error(err.stack);

        if (err instanceof multer.MulterError) {
            if (err.code === ERROR_MESSAGES.LIMIT_FILE_SIZE) {
                return res
                    .status(400)
                    .json({ error: ERROR_MESSAGES.FILE_TOO_LARGE });
            }
            return res
                .status(400)
                .json({ error: ERROR_MESSAGES.FILE_UPLOAD_ERROR });
        }

        if (err.message === ERROR_MESSAGES.INVALID_FILE_TYPE) {
            return res
                .status(400)
                .json({ error: ERROR_MESSAGES.INVALID_FILE_TYPE });
        }

        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    },
};
