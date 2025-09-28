<template>
    <div class="order-details">
        <div class="page-header">
            <router-link to="/orders" class="back-link">
                ← Назад к списку заказов
            </router-link>
            <h1 class="page-title">📦 Детали заказа</h1>
        </div>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            Загрузка заказа...
        </div>

        <div v-else-if="error" class="error-message">
            <div class="error-icon">❌</div>
            <div class="error-text">{{ error }}</div>
            <router-link to="/orders" class="btn btn-secondary">
                Вернуться к списку
            </router-link>
        </div>

        <div v-else-if="order" class="order-content">
            <div class="order-header">
                <div class="order-info">
                    <div class="order-id">
                        <span class="label">ID заказа:</span>
                        <span class="value">{{ order.id }}</span>
                    </div>

                    <div class="order-customer">
                        <span class="label">ID клиента:</span>
                        <span class="value">{{ order.customerId }}</span>
                    </div>

                    <div class="order-date">
                        <span class="label">Дата создания:</span>
                        <span class="value">{{
                            formatDate(order.createdAt)
                        }}</span>
                    </div>
                </div>

                <div class="order-status">
                    <div
                        class="status-badge"
                        :class="{ 'big-order': order.isBigOrder }"
                    >
                        {{
                            order.isBigOrder
                                ? "⭐ Крупный заказ"
                                : "📦 Обычный заказ"
                        }}
                    </div>
                </div>
            </div>

            <div class="items-section">
                <h2 class="section-title">🛍️ Товары в заказе</h2>

                <div class="items-table">
                    <div class="table-header">
                        <div class="col-product">Товар</div>
                        <div class="col-qty">Количество</div>
                        <div class="col-price">Цена за единицу</div>
                        <div class="col-total">Сумма</div>
                    </div>

                    <div
                        v-for="(item, index) in order.items"
                        :key="index"
                        class="table-row"
                    >
                        <div class="col-product">
                            <div class="product-info">
                                <div class="product-id">
                                    {{ item.productId }}
                                </div>
                            </div>
                        </div>

                        <div class="col-qty">
                            <span class="qty-badge">{{ item.qty }}</span>
                        </div>

                        <div class="col-price">
                            {{ formatCurrency(item.price) }}
                        </div>

                        <div class="col-total">
                            <strong>{{
                                formatCurrency(item.qty * item.price)
                            }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="order-summary">
                <div class="summary-card">
                    <h3 class="summary-title">💰 Итоговая сумма</h3>

                    <div class="summary-details">
                        <div class="summary-row">
                            <span class="summary-label"
                                >Количество товаров:</span
                            >
                            <span class="summary-value">{{ totalItems }}</span>
                        </div>

                        <div class="summary-row">
                            <span class="summary-label">Общая стоимость:</span>
                            <span class="summary-value total-amount">{{
                                formatCurrency(order.totalAmount)
                            }}</span>
                        </div>

                        <div class="summary-row">
                            <span class="summary-label">Статус заказа:</span>
                            <span
                                class="summary-badge"
                                :class="{ 'big-order': order.isBigOrder }"
                            >
                                {{
                                    order.isBigOrder
                                        ? "Крупный заказ (≥ 10 000 ₽)"
                                        : "Обычный заказ (< 10 000 ₽)"
                                }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="order-actions">
                <router-link to="/orders" class="btn btn-secondary">
                    📋 Все заказы
                </router-link>

                <router-link to="/orders/create" class="btn btn-primary">
                    ➕ Создать новый заказ
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ordersAPI, formatUtils } from "../services/api.js";

export default {
    name: "OrderDetails",
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const route = useRoute();
        const order = ref(null);
        const loading = ref(true);
        const error = ref("");

        const totalItems = computed(() => {
            if (!order.value) return 0;
            return order.value.items.reduce(
                (total, item) => total + item.qty,
                0
            );
        });

        const loadOrder = async () => {
            try {
                loading.value = true;
                error.value = "";

                const orderId = props.id || route.params.id;
                const response = await ordersAPI.getOrderById(orderId);
                order.value = response.data;
            } catch (err) {
                error.value = err.message || "Ошибка при загрузке заказа";
            } finally {
                loading.value = false;
            }
        };

        const formatCurrency = (amount) => {
            return formatUtils.formatCurrency(amount);
        };

        const formatDate = (dateString) => {
            return formatUtils.formatDate(dateString);
        };

        onMounted(() => {
            loadOrder();
        });

        return {
            order,
            loading,
            error,
            totalItems,
            formatCurrency,
            formatDate,
        };
    },
};
</script>

<style scoped>
.order-details {
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 2rem;
}

.back-link {
    display: inline-block;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
}

.back-link:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.page-title {
    font-size: 2.5rem;
    color: white;
    margin: 0;
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

.order-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.order-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.order-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.order-id,
.order-customer,
.order-date {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.label {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    min-width: 140px;
}

.value {
    color: white;
    font-weight: 600;
    font-family: "Courier New", monospace;
}

.status-badge {
    padding: 1rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    font-size: 1.1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
}

.status-badge.big-order {
    background: rgba(255, 193, 7, 0.2);
    border-color: rgba(255, 193, 7, 0.3);
    color: #ffd700;
}

.items-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
}

.items-table {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr 1.5fr;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
}

.table-header {
    background: rgba(255, 255, 255, 0.1);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.table-row {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    transition: all 0.3s;
}

.table-row:hover {
    background: rgba(255, 255, 255, 0.1);
}

.col-product,
.col-qty,
.col-price,
.col-total {
    display: flex;
    align-items: center;
}

.col-total {
    justify-content: flex-end;
}

.product-info {
    display: flex;
    flex-direction: column;
}

.product-id {
    font-weight: 600;
    font-family: "Courier New", monospace;
}

.qty-badge {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid rgba(76, 175, 80, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    color: #4caf50;
}

.order-summary {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-card {
    max-width: 500px;
    margin: 0 auto;
}

.summary-title {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

.summary-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-row:last-child {
    border-bottom: none;
}

.summary-label {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

.summary-value {
    color: white;
    font-weight: 600;
}

.total-amount {
    font-size: 1.5rem;
    color: #4caf50;
}

.summary-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-badge.big-order {
    background: rgba(255, 193, 7, 0.2);
    border-color: rgba(255, 193, 7, 0.3);
    color: #ffd700;
}

.order-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 1rem 2rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s;
    display: inline-block;
}

.btn-primary {
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .order-header {
        flex-direction: column;
        text-align: center;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .table-header {
        display: none;
    }

    .table-row {
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
    }

    .col-product::before {
        content: "Товар: ";
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
    }

    .col-qty::before {
        content: "Количество: ";
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
    }

    .col-price::before {
        content: "Цена: ";
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
    }

    .col-total::before {
        content: "Сумма: ";
        font-weight: 600;
        color: rgba(255, 255, 255, 0.8);
    }

    .col-total {
        justify-content: flex-start;
    }

    .order-actions {
        flex-direction: column;
    }

    .page-title {
        font-size: 2rem;
    }
}
</style>
