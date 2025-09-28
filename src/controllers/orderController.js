const orderService = require("../services/OrderService");
const APP_CONSTANTS = require("../constants/constants");

class OrderController {
    async createOrder(req, res, next) {
        try {
            const orderData = req.body;
            const order = orderService.createOrder(orderData);

            res.status(APP_CONSTANTS.HTTP_STATUS.CREATED).json({
                success: true,
                message: APP_CONSTANTS.SUCCESS_MESSAGES.ORDER_CREATED,
                data: order.toJSON(),
            });
        } catch (error) {
            next(error);
        }
    }

    async getOrderById(req, res, next) {
        try {
            const { id } = req.params;
            const order = orderService.getOrderById(id);

            res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: {
                    id: order.id,
                    customerId: order.customerId,
                    items: order.items,
                    totalAmount: order.totalAmount,
                    isBigOrder: order.isBigOrder,
                    createdAt: order.createdAt,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllOrders(req, res, next) {
        try {
            const orders = orderService.getAllOrders();

            res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                data: orders.map((order) => order.toJSON()),
                count: orders.length,
            });
        } catch (error) {
            next(error);
        }
    }
}

const orderController = new OrderController();

module.exports = orderController;
