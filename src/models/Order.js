const { v4: uuidv4 } = require("uuid");
const APP_CONSTANTS = require("../constants/constants");

class Order {
    constructor(customerId, items) {
        this.id = uuidv4();
        this.customerId = customerId;
        this.items = items || [];
        this.createdAt = new Date();
        this.totalAmount = this.calculateTotalAmount();
        this.isBigOrder = this.totalAmount >= APP_CONSTANTS.BIG_ORDER_THRESHOLD;
    }

    calculateTotalAmount() {
        return this.items.reduce((total, item) => {
            return total + item.price * item.qty;
        }, 0);
    }

    static validate(orderData) {
        const errors = [];

        if (!orderData.customerId) {
            errors.push(APP_CONSTANTS.ERROR_MESSAGES.INVALID_CUSTOMER_ID);
        }

        if (!orderData.items || orderData.items.length === 0) {
            errors.push(APP_CONSTANTS.ERROR_MESSAGES.EMPTY_ORDER);
        } else {
            orderData.items.forEach((item, index) => {
                if (!item.productId) {
                    errors.push(
                        `Товар ${
                            index + APP_CONSTANTS.VALIDATION.ITEM_INDEX_OFFSET
                        }: ${APP_CONSTANTS.ERROR_MESSAGES.INVALID_PRODUCT_ID}`
                    );
                }

                if (
                    !item.qty ||
                    item.qty <= APP_CONSTANTS.ANALYTICS.MIN_ORDERS_COUNT
                ) {
                    errors.push(
                        `Товар ${
                            index + APP_CONSTANTS.VALIDATION.ITEM_INDEX_OFFSET
                        }: ${APP_CONSTANTS.ERROR_MESSAGES.INVALID_QUANTITY}`
                    );
                }

                if (
                    !item.price ||
                    item.price <= APP_CONSTANTS.ANALYTICS.MIN_ORDERS_COUNT
                ) {
                    errors.push(
                        `Товар ${
                            index + APP_CONSTANTS.VALIDATION.ITEM_INDEX_OFFSET
                        }: ${APP_CONSTANTS.ERROR_MESSAGES.INVALID_PRICE}`
                    );
                }
            });
        }

        return errors;
    }

    toJSON() {
        return {
            id: this.id,
            customerId: this.customerId,
            items: this.items,
            totalAmount: this.totalAmount,
            isBigOrder: this.isBigOrder,
            createdAt: this.createdAt,
        };
    }
}

module.exports = Order;
