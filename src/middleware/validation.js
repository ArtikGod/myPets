const Joi = require("joi");
const APP_CONSTANTS = require("../constants/constants");

const createOrderSchema = Joi.object({
    customerId: Joi.string().required().messages({
        "any.required": APP_CONSTANTS.ERROR_MESSAGES.INVALID_CUSTOMER_ID,
        "string.empty": APP_CONSTANTS.ERROR_MESSAGES.INVALID_CUSTOMER_ID,
    }),
    items: Joi.array()
        .min(1)
        .items(
            Joi.object({
                productId: Joi.string().required().messages({
                    "any.required":
                        APP_CONSTANTS.ERROR_MESSAGES.INVALID_PRODUCT_ID,
                    "string.empty":
                        APP_CONSTANTS.ERROR_MESSAGES.INVALID_PRODUCT_ID,
                }),
                qty: Joi.number().integer().min(1).required().messages({
                    "any.required":
                        APP_CONSTANTS.ERROR_MESSAGES.INVALID_QUANTITY,
                    "number.min": APP_CONSTANTS.ERROR_MESSAGES.INVALID_QUANTITY,
                    "number.integer":
                        APP_CONSTANTS.ERROR_MESSAGES.INVALID_QUANTITY,
                }),
                price: Joi.number().positive().required().messages({
                    "any.required": APP_CONSTANTS.ERROR_MESSAGES.INVALID_PRICE,
                    "number.positive":
                        APP_CONSTANTS.ERROR_MESSAGES.INVALID_PRICE,
                }),
            })
        )
        .required()
        .messages({
            "array.min": APP_CONSTANTS.ERROR_MESSAGES.EMPTY_ORDER,
            "any.required": APP_CONSTANTS.ERROR_MESSAGES.EMPTY_ORDER,
        }),
});

const orderIdSchema = Joi.object({
    id: Joi.string().uuid().required().messages({
        "string.guid": APP_CONSTANTS.ERROR_MESSAGES.INVALID_ORDER_ID_FORMAT,
        "any.required": APP_CONSTANTS.ERROR_MESSAGES.MISSING_ORDER_ID,
    }),
});

const validateCreateOrder = (req, res, next) => {
    const { error } = createOrderSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: APP_CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR_TITLE,
            details: errorMessages,
        });
    }

    next();
};

const validateOrderId = (req, res, next) => {
    const { error } = orderIdSchema.validate(req.params);

    if (error) {
        return res.status(APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: error.details[0].message,
        });
    }

    next();
};

const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);

    if (res.headersSent) {
        return next(err);
    }

    let statusCode = APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;

    if (err.message.includes("не найден")) {
        statusCode = APP_CONSTANTS.HTTP_STATUS.NOT_FOUND;
    } else if (
        err.message.includes("валидации") ||
        err.message.includes("должно") ||
        err.message.includes("обязателен")
    ) {
        statusCode = APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST;
    }

    res.status(statusCode).json({
        success: false,
        error: err.message,
    });
};

const notFoundHandler = (req, res) => {
    res.status(APP_CONSTANTS.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: APP_CONSTANTS.ERROR_MESSAGES.ENDPOINT_NOT_FOUND,
    });
};

module.exports = {
    validateCreateOrder,
    validateOrderId,
    errorHandler,
    notFoundHandler,
};
