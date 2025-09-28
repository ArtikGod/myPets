import axios from "axios";
import {
    API_CONFIG,
    API_ENDPOINTS,
    ERROR_MESSAGES,
    LOCALE_CONFIG,
} from "../constants/constants.js";

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        "Content-Type": API_CONFIG.HEADERS.CONTENT_TYPE,
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const ordersAPI = {
    async createOrder(orderData) {
        try {
            const response = await api.post(API_ENDPOINTS.ORDERS, orderData);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || ERROR_MESSAGES.ORDER.CREATE
            );
        }
    },

    async getOrderById(orderId) {
        try {
            const response = await api.get(
                `${API_ENDPOINTS.ORDERS}/${orderId}`
            );
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || ERROR_MESSAGES.ORDER.GET
            );
        }
    },

    async getAllOrders() {
        try {
            const response = await api.get(API_ENDPOINTS.ORDERS);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || ERROR_MESSAGES.ORDER.GET_ALL
            );
        }
    },
};

export const analyticsAPI = {
    async getWeeklyAnalytics() {
        try {
            const response = await api.get(API_ENDPOINTS.ANALYTICS.WEEKLY);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || ERROR_MESSAGES.ANALYTICS.WEEKLY
            );
        }
    },

    async getSummaryAnalytics() {
        try {
            const response = await api.get(API_ENDPOINTS.ANALYTICS.SUMMARY);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.error || ERROR_MESSAGES.ANALYTICS.SUMMARY
            );
        }
    },
};

export const systemAPI = {
    async getHealthCheck() {
        try {
            const response = await api.get(API_ENDPOINTS.SYSTEM.HEALTH);
            return response.data;
        } catch (error) {
            throw new Error(ERROR_MESSAGES.SYSTEM.SERVICE_UNAVAILABLE);
        }
    },

    async getLogStats() {
        try {
            const response = await api.get(API_ENDPOINTS.SYSTEM.LOG_STATS);
            return response.data;
        } catch (error) {
            throw new Error(ERROR_MESSAGES.SYSTEM.LOG_STATS);
        }
    },
};

export const formatUtils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat(LOCALE_CONFIG.LOCALE, {
            style: "currency",
            currency: LOCALE_CONFIG.CURRENCY,
        }).format(amount);
    },

    formatDate(dateString) {
        return new Intl.DateTimeFormat(
            LOCALE_CONFIG.LOCALE,
            LOCALE_CONFIG.DATE_FORMAT.FULL
        ).format(new Date(dateString));
    },

    formatShortDate(dateString) {
        return new Intl.DateTimeFormat(
            LOCALE_CONFIG.LOCALE,
            LOCALE_CONFIG.DATE_FORMAT.SHORT
        ).format(new Date(dateString));
    },
};

export default api;
