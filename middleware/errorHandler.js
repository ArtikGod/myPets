const multer = require("multer");
const { ERROR_MESSAGES, HTTP_STATUS } = require("../shared/constants");

module.exports = {
    errorHandler: (err, req, res, next) => {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err.stack);

        if (err instanceof multer.MulterError) {
            if (err.code === ERROR_MESSAGES.LIMIT_FILE_SIZE) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .json({ error: ERROR_MESSAGES.FILE_TOO_LARGE });
            }
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ error: ERROR_MESSAGES.FILE_UPLOAD_ERROR });
        }

        if (err.message === ERROR_MESSAGES.INVALID_FILE_TYPE) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ error: ERROR_MESSAGES.INVALID_FILE_TYPE });
        }

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    },
};
