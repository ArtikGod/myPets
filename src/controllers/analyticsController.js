const orderService = require("../services/OrderService");
const APP_CONSTANTS = require("../constants/constants");

class AnalyticsController {
    async getWeeklyAnalytics(req, res, next) {
        try {
            const analytics = orderService.getWeeklyAnalytics();

            res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: APP_CONSTANTS.SUCCESS_MESSAGES.WEEKLY_ANALYTICS,
                data: {
                    ordersCount: analytics.ordersCount,
                    totalAmount: analytics.totalAmount,
                    bigOrdersCount: analytics.bigOrdersCount,
                    uniqueCustomers: analytics.uniqueCustomers,
                    period: `${APP_CONSTANTS.ANALYTICS.DAYS_IN_WEEK} дней`,
                    generatedAt: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getSummaryAnalytics(req, res, next) {
        try {
            const allOrders = orderService.getAllOrders();

            const summary = {
                totalOrders: allOrders.length,
                totalRevenue: orderService.calculateTotalAmount(allOrders),
                totalBigOrders: orderService.countBigOrders(allOrders),
                totalUniqueCustomers:
                    orderService.countUniqueCustomers(allOrders),
                averageOrderValue:
                    allOrders.length > APP_CONSTANTS.ANALYTICS.MIN_ORDERS_COUNT
                        ? Math.round(
                              (orderService.calculateTotalAmount(allOrders) /
                                  allOrders.length) *
                                  APP_CONSTANTS.ANALYTICS.PERCENTAGE_MULTIPLIER
                          ) / APP_CONSTANTS.ANALYTICS.PERCENTAGE_MULTIPLIER
                        : APP_CONSTANTS.ANALYTICS.MIN_ORDERS_COUNT,
                bigOrderPercentage:
                    allOrders.length > APP_CONSTANTS.ANALYTICS.MIN_ORDERS_COUNT
                        ? Math.round(
                              (orderService.countBigOrders(allOrders) /
                                  allOrders.length) *
                                  APP_CONSTANTS.ANALYTICS
                                      .PERCENTAGE_MULTIPLIER *
                                  APP_CONSTANTS.ANALYTICS.PERCENTAGE_MULTIPLIER
                          ) / APP_CONSTANTS.ANALYTICS.PERCENTAGE_MULTIPLIER
                        : APP_CONSTANTS.ANALYTICS.MIN_ORDERS_COUNT,
            };

            res.status(APP_CONSTANTS.HTTP_STATUS.OK).json({
                success: true,
                message: APP_CONSTANTS.SUCCESS_MESSAGES.SUMMARY_ANALYTICS,
                data: {
                    ...summary,
                    generatedAt: new Date().toISOString(),
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

const analyticsController = new AnalyticsController();

module.exports = analyticsController;
