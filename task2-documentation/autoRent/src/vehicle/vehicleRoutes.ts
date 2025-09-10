import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express";
import { app } from "../app";
import { checkAuthorization } from "../middleware";
import { param, body, query, validationResult } from "express-validator";
import { SORT_BOTH_EXIST, VEHICLE_NOT_EXIST } from "../constants";

import {
    createVehicle,
    getVehicleData,
    getVehicleSort,
    newVehicleData,
    deleteVehicle,
} from "./vehicleService";

/**
 * @swagger
 * /vehicle:
 *   post:
 *     summary: Создать новый автомобиль
 *     tags: [Vehicles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *               - price
 *               - photo
 *             properties:
 *               make:
 *                 type: string
 *                 description: Марка автомобиля
 *                 example: Toyota
 *               model:
 *                 type: string
 *                 description: Модель автомобиля
 *                 example: Camry
 *               year:
 *                 type: number
 *                 minimum: 1900
 *                 maximum: 2025
 *                 description: Год выпуска
 *                 example: 2022
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Цена аренды за день
 *                 example: 2500.50
 *               photo:
 *                 type: string
 *                 description: URL фотографии автомобиля
 *                 example: https://example.com/car.jpg
 *     responses:
 *       201:
 *         description: Автомобиль успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
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
    "/vehicle",
    checkAuthorization,
    body(["make", "model", "year", "price", "photo"]).trim().notEmpty(),
    body("year").isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Year must be a valid year"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { make, model, year, price, photo } = req.body;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const vehicle = await createVehicle(userId, make, model, year, price, photo);
                res.status(StatusCodes.CREATED).send(vehicle);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes('Unauthorized')) {
                    res.status(StatusCodes.UNAUTHORIZED).send({ error: message });
                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
                }
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /vehicle/{vehicleId}:
 *   get:
 *     summary: Получить информацию об автомобиле
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId автомобиля
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Информация об автомобиле
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
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
 *       404:
 *         description: Автомобиль не найден
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
    "/vehicle/:vehicleId",
    checkAuthorization,
    param("vehicleId").isMongoId(),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { vehicleId }:any = req.params;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const vehicle = await getVehicleData(userId, vehicleId);
                res.status(StatusCodes.OK).send(vehicle);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes('Vehicle not found') || message.includes(VEHICLE_NOT_EXIST)) {
                    res.status(StatusCodes.NOT_FOUND).send({ error: 'Vehicle not found' });
                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
                }
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /vehicle:
 *   get:
 *     summary: Получить список автомобилей с фильтрацией и сортировкой
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [make, model, year, price]
 *         description: Поле для сортировки
 *         example: price
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Порядок сортировки
 *         example: asc
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Минимальная цена
 *         example: 1000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Максимальная цена
 *         example: 5000
 *       - in: query
 *         name: minYear
 *         schema:
 *           type: number
 *           minimum: 1900
 *           maximum: 2025
 *         description: Минимальный год выпуска
 *         example: 2020
 *       - in: query
 *         name: maxYear
 *         schema:
 *           type: number
 *           minimum: 1900
 *           maximum: 2025
 *         description: Максимальный год выпуска
 *         example: 2024
 *     responses:
 *       200:
 *         description: Список автомобилей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
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
app.get("/vehicle",
    checkAuthorization,
    query("sort_by").optional().isIn(['make', 'model', 'year', 'price']).withMessage("sort_by must be one of: make, model, year, price"),
    query("order").optional().isIn(['asc','desc']),
    query([ "sort_by", "order"]).custom((value, {req}:any) => {
        const sort_by = req.query.sort_by;
        const order = req.query.order;
        const bothExist = sort_by && order;
        const bothNotExist = !sort_by && !order;
        if (!bothExist && ! bothNotExist) {
            throw new Error(SORT_BOTH_EXIST);
        }
        return true;
    }),
    query(["minPrice", "maxPrice" ]).optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    query(["minYear", "maxYear" ]).optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Year must be valid"),
    query().custom((value, {req}:any) => {
        const { minPrice, maxPrice, minYear, maxYear } = req.query;
        if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
            throw new Error("minPrice cannot be greater than maxPrice");
        }
        if (minYear && maxYear && parseInt(minYear) > parseInt(maxYear)) {
            throw new Error("minYear cannot be greater than maxYear");
        }
        return true;
    }),
    async (req: Request, res: Response) => {
        const { sort_by, order, minPrice, maxPrice, minYear, maxYear } = req.query
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const vehicle = await getVehicleSort( sort_by, order, minPrice, maxPrice, minYear, maxYear )
                res.status(StatusCodes.OK).send(vehicle);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes('Unauthorized')) {
                    res.status(StatusCodes.UNAUTHORIZED).send({ error: message });
                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
                }
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

// Handle empty vehicle ID case - must be after /vehicle route
app.get("/vehicle/", (req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).send({ error: "Vehicle ID is required" });
});

/**
 * @swagger
 * /vehicle/{vehicleId}:
 *   put:
 *     summary: Обновить информацию об автомобиле
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId автомобиля
 *         example: 507f1f77bcf86cd799439012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *               - price
 *               - photo
 *             properties:
 *               make:
 *                 type: string
 *                 description: Марка автомобиля
 *                 example: Toyota
 *               model:
 *                 type: string
 *                 description: Модель автомобиля
 *                 example: Camry
 *               year:
 *                 type: number
 *                 minimum: 1900
 *                 maximum: 2025
 *                 description: Год выпуска
 *                 example: 2022
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Цена аренды за день
 *                 example: 2500.50
 *               photo:
 *                 type: string
 *                 description: URL фотографии автомобиля
 *                 example: https://example.com/car.jpg
 *     responses:
 *       200:
 *         description: Автомобиль успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
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
 *       404:
 *         description: Автомобиль не найден
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
    "/vehicle/:vehicleId",
    checkAuthorization,
    param("vehicleId").isMongoId(),
    body(["make", "model", "year", "price", "photo"]).trim().notEmpty(),
    body("year").isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage("Year must be a valid year"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { vehicleId }:any = req.params;
        const { make, model, year, price, photo } = req.body;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const vehicle = await newVehicleData(userId, vehicleId, make, model, year, price, photo);
                res.status(StatusCodes.OK).send(vehicle);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes('Vehicle not found') || message.includes(VEHICLE_NOT_EXIST)) {
                    res.status(StatusCodes.NOT_FOUND).send({ error: 'Vehicle not found' });
                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
                }
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

// Handle empty vehicle ID case for DELETE
app.delete("/vehicle/", (req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).send({ error: "Vehicle ID is required" });
});

/**
 * @swagger
 * /vehicle/{vehicleId}:
 *   delete:
 *     summary: Удалить автомобиль
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId автомобиля
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Автомобиль успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vehicle deleted successfully
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
 *       404:
 *         description: Автомобиль не найден
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
    "/vehicle/:vehicleId",
    checkAuthorization,
    param("vehicleId").isMongoId(),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { vehicleId }:any = req.params;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const vehicle = await deleteVehicle(userId, vehicleId);
                res.status(StatusCodes.OK).send(vehicle);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes('Vehicle not found') || message.includes(VEHICLE_NOT_EXIST)) {
                    res.status(StatusCodes.NOT_FOUND).send({ error: 'Vehicle not found' });
                } else {
                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: message });
                }
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

export default {
    createVehicle,
    getVehicleData,
    getVehicleSort,
    newVehicleData,
    deleteVehicle
};