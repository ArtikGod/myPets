import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express";
import { app } from "../app";
import { checkAuthorization } from "../middleware";
import { param, body, validationResult } from "express-validator";
import {
    createUser,
    createLicens,
    getUser,
    editUser,
    deleteUser,
} from "./userService";

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 maxLength: 50
 *                 description: Имя пользователя
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 example: password123
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Роли пользователя (опционально)
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post(
    "/users",
    body("username").trim().notEmpty().isLength({ max: 50 }).withMessage("Username must not exceed 50 characters"),
    body("email").isEmail(),
    body("password").isStrongPassword(),
    async (req: Request, res: Response) => {
        const { username, email, password, roles } = req.body;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const user = await createUser(username, email, password, roles);
                res.status(StatusCodes.CREATED).send(user);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /users/licens:
 *   post:
 *     summary: Добавить водительское удостоверение пользователю
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numberLicens
 *               - dateRelease
 *               - dateValidity
 *             properties:
 *               numberLicens:
 *                 type: number
 *                 description: Номер водительского удостоверения (10 цифр)
 *                 example: 1234567890
 *               dateRelease:
 *                 type: string
 *                 format: date
 *                 description: Дата выдачи (YYYY-MM-DD)
 *                 example: "2020-01-15"
 *               dateValidity:
 *                 type: string
 *                 format: date
 *                 description: Дата окончания действия (YYYY-MM-DD)
 *                 example: "2030-01-15"
 *     responses:
 *       200:
 *         description: Водительское удостоверение успешно добавлено
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post(
    "/users/licens",
    checkAuthorization,
    body("numberLicens").isNumeric().isLength({ min: 10, max: 10 }),
    body(["dateRelease", "dateValidity"]).trim().notEmpty().isISO8601().withMessage("Date must be in valid ISO format (YYYY-MM-DD)"),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { numberLicens, dateRelease, dateValidity } = req.body;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const licens = await createLicens(userId, numberLicens, dateRelease, dateValidity);
                res.status(StatusCodes.OK).send(licens);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получить информацию о пользователе
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId пользователя
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get(
    "/users/:id",
    checkAuthorization,
    param("id").isMongoId(),
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = req.headers.authorization;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const user = await getUser(userId, id);
                res.status(StatusCodes.OK).send(user);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Обновить информацию о пользователе
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId пользователя
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Новый email пользователя
 *                 example: newemail@example.com
 *               numberLicens:
 *                 type: number
 *                 description: Номер водительского удостоверения (10 цифр)
 *                 example: 1234567890
 *               dateRelease:
 *                 type: string
 *                 format: date
 *                 description: Дата выдачи удостоверения
 *                 example: "2020-01-15"
 *               dateValidity:
 *                 type: string
 *                 format: date
 *                 description: Дата окончания действия удостоверения
 *                 example: "2030-01-15"
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put(
    "/users/:id",
    checkAuthorization,
    param("id").isMongoId(),
    body("email").optional().isEmail(),
    body("numberLicens").optional().isNumeric().isLength({ min: 10, max: 10 }),
    body(["dateRelease", "dateValidity"]).optional().trim().notEmpty(),
    body().custom((value, { req }) => {
        const { email, numberLicens, dateRelease, dateValidity } = req.body;
        if (!email && !numberLicens && !dateRelease && !dateValidity) {
            throw new Error("At least one field must be provided for update");
        }
        return true;
    }),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { id } = req.params;
        const { email, numberLicens, dateRelease, dateValidity } =
                    req.body;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const user = await editUser(
                    userId,
                    id,
                    email,
                    numberLicens,
                    dateRelease,
                    dateValidity
                );
                res.status(StatusCodes.OK).send(user);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId пользователя
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Пользователь успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete(
    "/users/:id",
    checkAuthorization,
    param("id").isMongoId(),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { id } = req.params;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const user = await deleteUser(userId, id);
                res.status(StatusCodes.OK).send(user);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

export default {
    createUser,
    createLicens,
    getUser,
    editUser,
    deleteUser
};