const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const config = require("../config");
const { authenticateToken } = require("../middleware/auth");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../shared/constants");

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
        if (config.FILES.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
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
                .status(400)
                .json({ error: ERROR_MESSAGES.NO_FILE_UPLOADED });
        }

        try {
            const { originalname, mimetype, size, filename } = req.file;
            const extension = path.extname(originalname).substring(1);

            await db
                .getPool()
                .execute(
                    "INSERT INTO files (name, extension, mime_type, size, upload_date, user_id, path) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
                    [
                        originalname,
                        extension,
                        mimetype,
                        size,
                        req.user.userId,
                        filename,
                    ]
                );

            res.status(201).json({ message: SUCCESS_MESSAGES.FILE_UPLOADED });
        } catch (err) {
            console.error(err);
            fs.unlinkSync(
                path.join(config.FILES.UPLOAD_DIR, req.file.filename)
            );
            res.status(500).json({
                error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
);

router.get("/list", authenticateToken, async (req, res) => {
    const page = parseInt(req.query.page) || config.PAGINATION.DEFAULT_PAGE;
    const listSize =
        parseInt(req.query.list_size) || config.PAGINATION.DEFAULT_LIST_SIZE;
    const offset = (page - 1) * listSize;

    try {
        const [files] = await db
            .getPool()
            .execute(
                "SELECT id, name, extension, mime_type, size, upload_date FROM files WHERE user_id = ? LIMIT ? OFFSET ?",
                [req.user.userId, listSize, offset]
            );

        const [total] = await db
            .getPool()
            .execute("SELECT COUNT(*) as count FROM files WHERE user_id = ?", [
                req.user.userId,
            ]);

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
        console.error(err);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
});

router.delete("/delete/:id", authenticateToken, async (req, res) => {
    try {
        const [files] = await db
            .getPool()
            .execute("SELECT path FROM files WHERE id = ? AND user_id = ?", [
                req.params.id,
                req.user.userId,
            ]);

        if (files.length === 0) {
            return res
                .status(404)
                .json({ error: ERROR_MESSAGES.FILE_NOT_FOUND });
        }

        const filePath = path.join(config.FILES.UPLOAD_DIR, files[0].path);

        await db
            .getPool()
            .execute("DELETE FROM files WHERE id = ? AND user_id = ?", [
                req.params.id,
                req.user.userId,
            ]);

        fs.unlink(filePath, (err) => {
            if (err) console.error(ERROR_MESSAGES.FILE_DELETE_ERROR, err);
        });

        res.json({ message: SUCCESS_MESSAGES.FILE_DELETED });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
});

router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const [files] = await db
            .getPool()
            .execute(
                "SELECT id, name, extension, mime_type, size, upload_date FROM files WHERE id = ? AND user_id = ?",
                [req.params.id, req.user.userId]
            );

        if (files.length === 0) {
            return res
                .status(404)
                .json({ error: ERROR_MESSAGES.FILE_NOT_FOUND });
        }

        res.json(files[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
});

router.get("/download/:id", authenticateToken, async (req, res) => {
    try {
        const [files] = await db
            .getPool()
            .execute(
                "SELECT name, path FROM files WHERE id = ? AND user_id = ?",
                [req.params.id, req.user.userId]
            );

        if (files.length === 0) {
            return res
                .status(404)
                .json({ error: ERROR_MESSAGES.FILE_NOT_FOUND });
        }

        const filePath = path.join(config.FILES.UPLOAD_DIR, files[0].path);
        res.download(filePath, files[0].name);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
});

router.put(
    "/update/:id",
    authenticateToken,
    upload.single("file"),
    async (req, res) => {
        if (!req.file) {
            return res
                .status(400)
                .json({ error: ERROR_MESSAGES.NO_FILE_UPLOADED });
        }

        try {
            const [oldFiles] = await db
                .getPool()
                .execute(
                    "SELECT path FROM files WHERE id = ? AND user_id = ?",
                    [req.params.id, req.user.userId]
                );

            if (oldFiles.length === 0) {
                return res
                    .status(404)
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
                .execute(
                    "UPDATE files SET name = ?, extension = ?, mime_type = ?, size = ?, path = ?, upload_date = NOW() WHERE id = ? AND user_id = ?",
                    [
                        originalname,
                        extension,
                        mimetype,
                        size,
                        filename,
                        req.params.id,
                        req.user.userId,
                    ]
                );

            fs.unlink(oldFilePath, (err) => {
                if (err) console.error(ERROR_MESSAGES.FILE_DELETE_ERROR, err);
            });

            res.json({ message: SUCCESS_MESSAGES.FILE_UPDATED });
        } catch (err) {
            console.error(err);
            if (req.file) {
                fs.unlinkSync(
                    path.join(config.FILES.UPLOAD_DIR, req.file.filename)
                );
            }
            res.status(500).json({
                error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
            });
        }
    }
);

module.exports = router;
