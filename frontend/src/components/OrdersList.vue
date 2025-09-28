<template>
    <div class="orders-list">
        <div class="page-header">
            <h1 class="page-title">📋 Все заказы</h1>
            <div class="header-actions">
                <router-link to="/orders/create" class="btn btn-primary">
                    ➕ Создать заказ
                </router-link>
                <button
                    @click="refreshOrders"
                    class="btn btn-secondary"
                    :disabled="loading"
                >
                    🔄 Обновить
                </button>
            </div>
        </div>

        <div class="stats-bar" v-if="orders.length > 0">
            <div class="stat-item">
                <span class="stat-label">Всего заказов:</span>
                <span class="stat-value">{{ orders.length }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Общая сумма:</span>
                <span class="stat-value">{{
                    formatCurrency(totalAmount)
                }}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Крупных заказов:</span>
                <span class="stat-value">{{ bigOrdersCount }}</span>
            </div>
        </div>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            Загрузка заказов...
        </div>

        <div v-else-if="error" class="error-message">
            <div class="error-icon">❌</div>
            <div class="error-text">{{ error }}</div>
            <button @click="refreshOrders" class="btn btn-primary">
                Попробовать снова
            </button>
        </div>

        <div v-else-if="orders.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <h2 class="empty-title">Заказов пока нет</h2>
            <p class="empty-text">Создайте первый заказ, чтобы начать работу</p>
            <router-link to="/orders/create" class="btn btn-primary">
                ➕ Создать первый заказ
            </router-link>
        </div>

        <div v-else class="orders-grid">
            <div
                v-for="order in sortedOrders"
                :key="order.id"
                class="order-card"
                @click="goToOrder(order.id)"
            >
                <div class="order-header">
                    <div class="order-id">
                        <span class="id-label">ID:</span>
                        <span class="id-value"
                            >{{ order.id.substring(0, 8) }}...</span
                        >
                    </div>
                    <div
                        class="order-status"
                        :class="{ 'big-order': order.isBigOrder }"
                    >
                        {{ order.isBigOrder ? "⭐" : "📦" }}
                    </div>
                </div>

                <div class="order-info">
                    <div class="info-row">
                        <span class="info-label">Клиент:</span>
                        <span class="info-value">{{ order.customerId }}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Товаров:</span>
                        <span class="info-value">{{ order.items.length }}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Дата:</span>
                        <span class="info-value">{{
                            formatShortDate(order.createdAt)
                        }}</span>
                    </div>
                </div>

                <div class="order-amount">
                    <div class="amount-value">
                        {{ formatCurrency(order.totalAmount) }}
                    </div>
                    <div class="amount-label">
                        {{
                            order.isBigOrder ? "Крупный заказ" : "Обычный заказ"
                        }}
                    </div>
                </div>

            </div>
        </div>

        <div v-if="orders.length > 0" class="pagination-info">
            Показано {{ orders.length }} заказов
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ordersAPI, formatUtils } from "../services/api.js";

export default {
    name: "OrdersList",
    setup() {
        const router = useRouter();
        const orders = ref([]);
        const loading = ref(true);
        const error = ref("");

        const sortedOrders = computed(() => {
            return [...orders.value].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        });

        const totalAmount = computed(() => {
            return orders.value.reduce(
                (total, order) => total + order.totalAmount,
                0
            );
        });

        const bigOrdersCount = computed(() => {
            return orders.value.filter((order) => order.isBigOrder).length;
        });

        const loadOrders = async () => {
            try {
                loading.value = true;
                error.value = "";

                const response = await ordersAPI.getAllOrders();
                orders.value = response.data || [];
            } catch (err) {
                error.value = err.message || "Ошибка при загрузке заказов";
                orders.value = [];
            } finally {
                loading.value = false;
            }
        };

        const refreshOrders = () => {
            loadOrders();
        };

        const goToOrder = (orderId) => {
            router.push(`/orders/${orderId}`);
        };

        const formatCurrency = (amount) => {
            return formatUtils.formatCurrency(amount);
        };

        const formatShortDate = (dateString) => {
            return formatUtils.formatShortDate(dateString);
        };

        onMounted(() => {
            loadOrders();
        });

        return {
            orders,
            loading,
            error,
            sortedOrders,
            totalAmount,
            bigOrdersCount,
            refreshOrders,
            goToOrder,
            formatCurrency,
            formatShortDate,
        };
    },
};
</script>

<style scoped>
.orders-list {
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.page-title {
    font-size: 2.5rem;
    color: white;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.stats-bar {
    display: flex;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    flex-wrap: wrap;
    justify-content: center;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    min-width: 120px;
    flex: 1;
}

.stat-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
}

.stat-value {
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.2;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem;
    color: white;
    font-size: 1.2rem;
}

.spinner {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 3px solid white;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-right: 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.error-message {
    text-align: center;
    padding: 3rem;
    background: rgba(244, 67, 54, 0.1);
    border-radius: 16px;
    border: 1px solid rgba(244, 67, 54, 0.3);
}

.error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.error-text {
    color: #f44336;
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
}

.empty-title {
    color: white;
    font-size: 2rem;
    margin-bottom: 1rem;
}

.empty-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    margin-bottom: 2rem;
}

.orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.order-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
}

.order-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.order-id {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.id-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

.id-value {
    color: white;
    font-family: "Courier New", monospace;
    font-weight: 600;
}

.order-status {
    font-size: 1.5rem;
    padding: 0.5rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
}

.order-status.big-order {
    background: rgba(255, 193, 7, 0.2);
    border: 1px solid rgba(255, 193, 7, 0.3);
}

.order-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

.info-value {
    color: white;
    font-weight: 600;
}

.order-amount {
    text-align: center;
    padding: 1rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0;
}

.amount-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #4caf50;
    margin-bottom: 0.25rem;
}

.amount-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}


.btn {
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-block;
}

.btn-primary {
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.pagination-info {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    padding: 1rem;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        text-align: center;
    }

    .page-title {
        font-size: 2rem;
    }

    .header-actions {
        justify-content: center;
    }

    .stats-bar {
        justify-content: center;
    }

    .orders-grid {
        grid-template-columns: 1fr;
    }

    .order-card {
        margin: 0 1rem;
    }
}

@media (max-width: 480px) {
    .stats-bar {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .stat-item {
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        min-width: auto;
    }

    .stat-item:last-child {
        border-bottom: none;
    }

    .stat-value {
        font-size: 1.1rem;
        max-width: 60%;
        text-align: right;
    }

    .stat-label {
        text-align: left;
        max-width: 35%;
    }
}
</style>
