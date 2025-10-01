const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const config = require("../config");
const { authenticateToken } = require("../middleware/auth");
const ValidationService = require("../services/validationService");
const {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    HTTP_STATUS,
    SQL_QUERIES,
} = require("../shared/constants");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.FILES.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage,
    limits: { fileSize: config.FILES.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const validation = ValidationService.validateFile(
            file,
            config.FILES.ALLOWED_MIME_TYPES,
            config.FILES.MAX_FILE_SIZE
        );

        if (validation.isValid) {
            cb(null, true);
        } else {
            cb(new Error(validation.error), false);
        }
    },
});

router.post(
    "/upload",
    authenticateToken,
    upload.single("file"),
    async (req, res) => {
        if (!req.file) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ error: ERROR_MESSAGES.NO_FILE_UPLOADED });
        }

        try {
            const { originalname, mimetype, size, filename } = req.file;
            const extension = path.extname(originalname).substring(1);

            await db
                .getPool()
                .execute(SQL_QUERIES.FILES.INSERT_FILE, [
                    originalname,
                    extension,
                    mimetype,
                    size,
                    req.user.userId,
                    filename,
                ]);

            res.status(HTTP_STATUS.CREATED).json({
                message: SUCCESS_MESSAGES.FILE_UPLOADED,
            });
        } catch (err) {
            console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
            fs.unlinkSync(
                path.join(config.FILES.UPLOAD_DIR, req.file.filename)
            );
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
);

router.get("/list", authenticateToken, async (req, res) => {
    const paginationValidation = ValidationService.validatePagination(
        req.query.page,
        req.query.list_size
    );

    if (!paginationValidation.isValid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: ERROR_MESSAGES.INVALID_PAGINATION_PARAMS,
            details: paginationValidation.errors,
        });
    }

    const page = parseInt(req.query.page) || config.PAGINATION.DEFAULT_PAGE;
    const listSize =
        parseInt(req.query.list_size) || config.PAGINATION.DEFAULT_LIST_SIZE;
    const offset = (page - 1) * listSize;

    try {
        const [files] = await db
            .getPool()
            .execute(SQL_QUERIES.FILES.SELECT_FILES_BY_USER, [
                req.user.userId,
                listSize,
                offset,
            ]);

        const [total] = await db
            .getPool()
            .execute(SQL_QUERIES.FILES.COUNT_FILES_BY_USER, [req.user.userId]);

        res.json({
            files,
            pagination: {
                page,
                listSize,
                totalPages: Math.ceil(total[0].count / listSize),
                totalFiles: total[0].count,
            },
        });
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

router.delete("/delete/:id", authenticateToken, async (req, res) => {
    const fileIdValidation = ValidationService.validateFileId(req.params.id);
    if (!fileIdValidation.isValid) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: fileIdValidation.error });
    }

    try {
        const [files] = await db
            .getPool()
            .execute(SQL_QUERIES.FILES.SELECT_FILE_PATH, [
                fileIdValidation.fileId,
                req.user.userId,
            ]);

        if (files.length === 0) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ error: ERROR_MESSAGES.FILE_NOT_FOUND });
        }

        const filePath = path.join(config.FILES.UPLOAD_DIR, files[0].path);

        await db
            .getPool()
            .execute(SQL_QUERIES.FILES.DELETE_FILE, [
                fileIdValidation.fileId,
                req.user.userId,
            ]);

        fs.unlink(filePath, (err) => {
            if (err) console.error(ERROR_MESSAGES.FILE_DELETE_ERROR, err);
        });

        res.json({ message: SUCCESS_MESSAGES.FILE_DELETED });
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

router.get("/:id", authenticateToken, async (req, res) => {
    const fileIdValidation = ValidationService.validateFileId(req.params.id);
    if (!fileIdValidation.isValid) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: fileIdValidation.error });
    }

    try {
        const [files] = await db
            .getPool()
            .execute(SQL_QUERIES.FILES.SELECT_FILE_INFO, [
                fileIdValidation.fileId,
                req.user.userId,
            ]);

        if (files.length === 0) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ error: ERROR_MESSAGES.FILE_NOT_FOUND });
        }

        res.json(files[0]);
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

router.get("/download/:id", authenticateToken, async (req, res) => {
    const fileIdValidation = ValidationService.validateFileId(req.params.id);
    if (!fileIdValidation.isValid) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ error: fileIdValidation.error });
    }

    try {
        const [files] = await db
            .getPool()
            .execute(SQL_QUERIES.FILES.SELECT_FILE_FOR_DOWNLOAD, [
                fileIdValidation.fileId,
                req.user.userId,
            ]);

        if (files.length === 0) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ error: ERROR_MESSAGES.FILE_NOT_FOUND });
        }

        const filePath = path.join(config.FILES.UPLOAD_DIR, files[0].path);
        res.download(filePath, files[0].name);
    } catch (err) {
        console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        });
    }
});

router.put(
    "/update/:id",
    authenticateToken,
    upload.single("file"),
    async (req, res) => {
        const fileIdValidation = ValidationService.validateFileId(
            req.params.id
        );
        if (!fileIdValidation.isValid) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ error: fileIdValidation.error });
        }

        if (!req.file) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ error: ERROR_MESSAGES.NO_FILE_UPLOADED });
        }

        try {
            const [oldFiles] = await db
                .getPool()
                .execute(SQL_QUERIES.FILES.SELECT_FILE_PATH, [
                    fileIdValidation.fileId,
                    req.user.userId,
                ]);

            if (oldFiles.length === 0) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json({ error: ERROR_MESSAGES.FILE_NOT_FOUND });
            }

            const oldFilePath = path.join(
                config.FILES.UPLOAD_DIR,
                oldFiles[0].path
            );

            const { originalname, mimetype, size, filename } = req.file;
            const extension = path.extname(originalname).substring(1);

            await db
                .getPool()
                .execute(SQL_QUERIES.FILES.UPDATE_FILE, [
                    originalname,
                    extension,
                    mimetype,
                    size,
                    filename,
                    fileIdValidation.fileId,
                    req.user.userId,
                ]);

            fs.unlink(oldFilePath, (err) => {
                if (err) console.error(ERROR_MESSAGES.FILE_DELETE_ERROR, err);
            });

            res.json({ message: SUCCESS_MESSAGES.FILE_UPDATED });
        } catch (err) {
            console.error(ERROR_MESSAGES.GENERIC_ERROR, err);
            if (req.file) {
                fs.unlinkSync(
                    path.join(config.FILES.UPLOAD_DIR, req.file.filename)
                );
            }
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
);

module.exports = router;
