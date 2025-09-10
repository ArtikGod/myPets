import { app } from "../app";
import { checkAuthorization } from "../middleware";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { param, body, validationResult } from "express-validator";
import { isBefore, differenceInCalendarDays  } from 'date-fns';
import { MAXIMUM_RESERVATIONS_DEFERENCE, DATE_RESERVATION } from "../constants"; 

import {
    createReservations,
    getReservationsVehicleAvailable,
    getStatisticComletedReservations,
    getStatisticUsers,
    getReservationsHistory,
    updateReservations,
    cancelReservations,
} from "./reservationsService";

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Создать новое бронирование
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - userId
 *               - leaseStart
 *               - leaseEnd
 *               - price
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 description: MongoDB ObjectId автомобиля
 *                 example: 507f1f77bcf86cd799439012
 *               userId:
 *                 type: string
 *                 description: MongoDB ObjectId пользователя
 *                 example: 507f1f77bcf86cd799439011
 *               leaseStart:
 *                 type: string
 *                 format: date
 *                 description: Дата начала аренды (не в прошлом)
 *                 example: "2024-01-15"
 *               leaseEnd:
 *                 type: string
 *                 format: date
 *                 description: Дата окончания аренды (максимум 28 дней от начала)
 *                 example: "2024-01-20"
 *               price:
 *                 type: number
 *                 description: Общая стоимость аренды
 *                 example: 12500.00
 *               status:
 *                 type: string
 *                 enum: [Done, Canceled, Completed]
 *                 description: Статус бронирования (опционально)
 *                 example: Done
 *     responses:
 *       201:
 *         description: Бронирование успешно создано
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
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
    "/reservations",
    checkAuthorization,
    body("vehicleId").isMongoId(),
    body("userId").isMongoId(),
    body("leaseStart").isDate(),
    body("leaseEnd").isDate().custom((leaseEnd, { req }) => {
        const leaseStart = req.body.leaseStart;
        const leaseStartDate = new Date(leaseStart);
        const leaseEndDate = new Date(leaseEnd);
        const isEndBeforeStart = leaseStartDate > leaseEndDate;
        if(isEndBeforeStart) {
            throw new Error (DATE_RESERVATION.WRONG)
        }
        const isPast = isBefore(leaseStartDate, new Date()) || isBefore(leaseEndDate, new Date());
        if (isPast) {
            throw new Error(DATE_RESERVATION.PAST);
        }
        const difference = differenceInCalendarDays(leaseEndDate, leaseStartDate);
        if (difference > MAXIMUM_RESERVATIONS_DEFERENCE) {
            throw new Error(DATE_RESERVATION.TOO_MUCH);
        }
        return true;
    }),
    body("price").notEmpty(),
    async (req: Request, res: Response) => {
        const {vehicleId, userId, leaseStart, leaseEnd, price, status} = req.body
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const reservations = await createReservations(vehicleId, userId, leaseStart, leaseEnd, price, status);
                res.status(StatusCodes.CREATED).send(reservations);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /reservations/statistic/completed:
 *   get:
 *     summary: Получить статистику завершенных бронирований
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Статистика завершенных бронирований
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completedReservations:
 *                   type: number
 *                   description: Количество завершенных бронирований
 *                   example: 25
 *                 totalRevenue:
 *                   type: number
 *                   description: Общий доход
 *                   example: 125000.00
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
app.get("/reservations/statistic/completed",
    checkAuthorization,
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const result = validationResult(req);
        if (result.isEmpty()) {
            try {
                const statistic = await getStatisticComletedReservations (userId);
                res.status(StatusCodes.OK).send(statistic);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /reservations/statistic/users:
 *   get:
 *     summary: Получить статистику пользователей
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: Статистика пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                   description: Общее количество пользователей
 *                   example: 150
 *                 activeUsers:
 *                   type: number
 *                   description: Количество активных пользователей
 *                   example: 75
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
app.get("/reservations/statistic/users",
    checkAuthorization,
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        } else {
            try {
                const statistic = await getStatisticUsers(userId);
                res.status(StatusCodes.OK).send(statistic);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
            }
        }
    }

);

/**
 * @swagger
 * /reservations/{vehicleId}:
 *   get:
 *     summary: Проверить доступность автомобиля для бронирования
 *     tags: [Reservations]
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
 *               - leaseStart
 *               - leaseEnd
 *             properties:
 *               leaseStart:
 *                 type: string
 *                 format: date
 *                 description: Дата начала аренды
 *                 example: "2024-01-15"
 *               leaseEnd:
 *                 type: string
 *                 format: date
 *                 description: Дата окончания аренды
 *                 example: "2024-01-20"
 *     responses:
 *       200:
 *         description: Информация о доступности автомобиля
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: Доступен ли автомобиль
 *                   example: true
 *                 conflictingReservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
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
app.get("/reservations/:vehicleId",
    checkAuthorization,
    param("vehicleId").isMongoId(),
    body(["leaseStart", "leaseEnd"]).isDate(),
    async (req: Request, res: Response) => {
        const { vehicleId } = req.params;
        const { leaseStart, leaseEnd } = req.body;
        const result = validationResult(req);
        if(result.isEmpty()) {
            try {
                const reservations = await getReservationsVehicleAvailable(vehicleId, leaseStart, leaseEnd)
                res.status(StatusCodes.OK).send(reservations);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /reservations/:
 *   get:
 *     summary: Получить историю бронирований пользователя
 *     tags: [Reservations]
 *     responses:
 *       200:
 *         description: История бронирований пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
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
app.get("/reservations/",
    checkAuthorization,
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const result = validationResult(req);
        if(result.isEmpty()) {
            try {
                const reservations = await getReservationsHistory(userId)
                res.status(StatusCodes.OK).send(reservations);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);


/**
 * @swagger
 * /reservations/{reservationsId}:
 *   put:
 *     summary: Обновить бронирование
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: reservationsId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId бронирования
 *         example: 507f1f77bcf86cd799439013
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicleId
 *               - leaseStart
 *               - leaseEnd
 *               - status
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 description: MongoDB ObjectId автомобиля
 *                 example: 507f1f77bcf86cd799439012
 *               leaseStart:
 *                 type: string
 *                 format: date
 *                 description: Дата начала аренды (не в прошлом)
 *                 example: "2024-01-15"
 *               leaseEnd:
 *                 type: string
 *                 format: date
 *                 description: Дата окончания аренды (максимум 28 дней от начала)
 *                 example: "2024-01-20"
 *               status:
 *                 type: string
 *                 enum: [Done, Canceled, Completed]
 *                 description: Новый статус бронирования
 *                 example: Completed
 *     responses:
 *       200:
 *         description: Бронирование успешно обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
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
app.put("/reservations/:reservationsId",
    checkAuthorization,
    param("reservationsId").isMongoId(),
    body("vehicleId").isMongoId(),
    body("leaseStart").isDate(),
    body("leaseEnd").isDate().custom((leaseEnd, { req }) => {
        const leaseStart = req.body.leaseStart;
        const leaseStartDate = new Date(leaseStart);
        const leaseEndDate = new Date(leaseEnd);
        const isEndBeforeStart = leaseStartDate > leaseEndDate;
        if(isEndBeforeStart) {
            throw new Error ('Wrong end date')
        }
        const isPast = isBefore(leaseStartDate, new Date()) || isBefore(leaseEndDate, new Date());
        if (isPast) {
            throw new Error('Date in the past');
        }
        const difference = differenceInCalendarDays(leaseEndDate, leaseStartDate);
        if (difference > MAXIMUM_RESERVATIONS_DEFERENCE) {
            throw new Error('Too much days for rent');
        }
        return true;
    }),
    body("status").notEmpty(),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { reservationsId } = req.params;
        const { vehicleId, leaseStart, leaseEnd, status } = req.body;
        const result = validationResult(req);
        if(result.isEmpty()) {
            try {
                const reservations = await updateReservations(userId, reservationsId, vehicleId, leaseStart, leaseEnd, status)
                res.status(StatusCodes.OK).send(reservations);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

/**
 * @swagger
 * /reservations/cancel/{reservationsId}:
 *   put:
 *     summary: Отменить бронирование
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: reservationsId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId бронирования
 *         example: 507f1f77bcf86cd799439013
 *     responses:
 *       200:
 *         description: Бронирование успешно отменено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
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
app.put("/reservations/cancel/:reservationsId",
    checkAuthorization,
    param("reservationsId").isMongoId(),
    async (req: Request, res: Response) => {
        const userId = req.headers.authorization;
        const { reservationsId } = req.params;
        const status = "Cancel";
        const result = validationResult(req);
        if(result.isEmpty()) {
            try {
                const reservations = await cancelReservations(userId, reservationsId, status)
                res.status(StatusCodes.OK).send(reservations);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(message);
            }
        } else {
            res.status(StatusCodes.BAD_REQUEST).send({ errors: result.array() });
        }
    }
);

export default {createReservations, getReservationsVehicleAvailable, getStatisticComletedReservations, getStatisticUsers, getReservationsHistory, updateReservations, cancelReservations};