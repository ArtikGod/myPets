const Order = require("../models/Order");
const APP_CONSTANTS = require("../constants/constants");

class OrderService {
    constructor() {
        this.orders = new Map();
    }

    createOrder(orderData) {
        const validationErrors = Order.validate(orderData);

        if (validationErrors.length > 0) {
            throw new Error(validationErrors.join("; "));
        }

        const order = new Order(orderData.customerId, orderData.items);
        this.orders.set(order.id, order);

        return order;
    }

    getOrderById(orderId) {
        const order = this.orders.get(orderId);

        if (!order) {
            throw new Error(APP_CONSTANTS.ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        return order;
    }

    getAllOrders() {
        return Array.from(this.orders.values());
    }

    getOrdersByDateRange(startDate, endDate) {
        return this.getAllOrders().filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && orderDate <= endDate;
        });
    }

    getWeeklyAnalytics() {
        const now = new Date();
        const weekAgo = new Date(
            now.getTime() -
                APP_CONSTANTS.ANALYTICS.DAYS_IN_WEEK *
                    APP_CONSTANTS.ANALYTICS.MILLISECONDS_IN_DAY
        );

        const weeklyOrders = this.getOrdersByDateRange(weekAgo, now);

        const analytics = {
            ordersCount: weeklyOrders.length,
            totalAmount: this.calculateTotalAmount(weeklyOrders),
            bigOrdersCount: this.countBigOrders(weeklyOrders),
            uniqueCustomers: this.countUniqueCustomers(weeklyOrders),
        };

        return analytics;
    }

    calculateTotalAmount(orders) {
        return orders.reduce((total, order) => total + order.totalAmount, 0);
    }

    countBigOrders(orders) {
        return orders.filter((order) => order.isBigOrder).length;
    }

    countUniqueCustomers(orders) {
        const uniqueCustomers = new Set();
        orders.forEach((order) => uniqueCustomers.add(order.customerId));
        return uniqueCustomers.size;
    }

    clearOrders() {
        this.orders.clear();
    }
}

const orderService = new OrderService();

module.exports = orderService;
