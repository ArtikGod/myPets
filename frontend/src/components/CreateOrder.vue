<template>
    <div class="create-order">
        <div class="page-header">
            <h1 class="page-title">➕ Создать новый заказ</h1>
            <p class="page-subtitle">Заполните форму для создания заказа</p>
        </div>

        <div class="form-container">
            <form @submit.prevent="createOrder" class="order-form">
                <div class="form-group">
                    <label for="customerId" class="form-label"
                        >ID клиента *</label
                    >
                    <input
                        type="text"
                        id="customerId"
                        v-model="orderData.customerId"
                        class="form-input"
                        placeholder="Введите ID клиента"
                        required
                    />
                </div>

                <div class="form-group">
                    <label class="form-label">Товары *</label>

                    <div class="items-list">
                        <div
                            v-for="(item, index) in orderData.items"
                            :key="index"
                            class="item-row"
                        >
                            <div class="item-fields">
                                <div class="field">
                                    <label
                                        :for="`productId-${index}`"
                                        class="field-label"
                                        >ID товара</label
                                    >
                                    <input
                                        type="text"
                                        :id="`productId-${index}`"
                                        v-model="item.productId"
                                        class="form-input"
                                        placeholder="ID товара"
                                        required
                                    />
                                </div>

                                <div class="field">
                                    <label
                                        :for="`price-${index}`"
                                        class="field-label"
                                        >Цена</label
                                    >
                                    <input
                                        type="number"
                                        :id="`price-${index}`"
                                        v-model.number="item.price"
                                        class="form-input"
                                        placeholder="Цена"
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div class="field field-qty">
                                    <label
                                        :for="`qty-${index}`"
                                        class="field-label"
                                        >Количество</label
                                    >
                                    <input
                                        type="number"
                                        :id="`qty-${index}`"
                                        v-model.number="item.qty"
                                        class="form-input"
                                        placeholder="Кол-во"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div class="field item-total">
                                    <label class="field-label">Сумма</label>
                                    <div class="total-value">
                                        {{
                                            formatCurrency(
                                                item.qty * item.price || 0
                                            )
                                        }}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                @click="removeItem(index)"
                                class="btn-remove"
                                :disabled="orderData.items.length === 1"
                                title="Удалить товар"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>

                    <button type="button" @click="addItem" class="btn-add-item">
                        ➕ Добавить товар
                    </button>
                </div>

                <div class="order-summary">
                    <div class="summary-row">
                        <span class="summary-label">Общая сумма:</span>
                        <span class="summary-value">{{
                            formatCurrency(totalAmount)
                        }}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Статус заказа:</span>
                        <span
                            class="summary-badge"
                            :class="{ 'big-order': isBigOrder }"
                        >
                            {{
                                isBigOrder
                                    ? "⭐ Крупный заказ"
                                    : "📦 Обычный заказ"
                            }}
                        </span>
                    </div>
                </div>

                <div class="form-actions">
                    <button
                        type="submit"
                        class="btn btn-primary"
                        :disabled="loading || !isFormValid"
                    >
                        <span v-if="loading" class="spinner-small"></span>
                        {{ loading ? "Создание..." : "✅ Создать заказ" }}
                    </button>

                    <router-link to="/orders" class="btn btn-secondary">
                        ❌ Отмена
                    </router-link>
                </div>
            </form>
        </div>

        <div v-if="message" class="message" :class="messageType">
            {{ message }}
        </div>
    </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ordersAPI, formatUtils } from "../services/api.js";

export default {
    name: "CreateOrder",
    setup() {
        const router = useRouter();

        const orderData = ref({
            customerId: "",
            items: [{ productId: "", qty: 1, price: 0 }],
        });

        const loading = ref(false);
        const message = ref("");
        const messageType = ref("success");

        const totalAmount = computed(() => {
            return orderData.value.items.reduce((total, item) => {
                return total + (item.qty * item.price || 0);
            }, 0);
        });

        const isBigOrder = computed(() => {
            return totalAmount.value >= 10000;
        });

        const isFormValid = computed(() => {
            if (!orderData.value.customerId.trim()) return false;

            return orderData.value.items.every(
                (item) =>
                    item.productId.trim() && item.qty > 0 && item.price > 0
            );
        });

        const addItem = () => {
            orderData.value.items.push({
                productId: "",
                qty: 1,
                price: 0,
            });
        };

        const removeItem = (index) => {
            if (orderData.value.items.length > 1) {
                orderData.value.items.splice(index, 1);
            }
        };

        const createOrder = async () => {
            if (!isFormValid.value) return;

            try {
                loading.value = true;
                message.value = "";

                const response = await ordersAPI.createOrder(orderData.value);

                message.value = "Заказ успешно создан!";
                messageType.value = "success";

                setTimeout(() => {
                    router.push(`/orders/${response.data.id}`);
                }, 2000);
            } catch (error) {
                message.value = error.message || "Ошибка при создании заказа";
                messageType.value = "error";
            } finally {
                loading.value = false;
            }
        };

        const formatCurrency = (amount) => {
            return formatUtils.formatCurrency(amount);
        };

        return {
            orderData,
            loading,
            message,
            messageType,
            totalAmount,
            isBigOrder,
            isFormValid,
            addItem,
            removeItem,
            createOrder,
            formatCurrency,
        };
    },
};
</script>

<style scoped>
.create-order {
    max-width: 1000px;
    margin: 0 auto;
}

.page-header {
    text-align: center;
    margin-bottom: 2rem;
}

.page-title {
    font-size: 2.5rem;
    color: white;
    margin-bottom: 0.5rem;
}

.page-subtitle {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
}

.form-container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.order-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
}

.form-input {
    padding: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;
    transition: all 0.3s;
}

.form-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.form-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.item-row {
    display: flex;
    align-items: end;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    min-width: 0;
    position: relative;
}

.item-fields {
    display: grid;
    grid-template-columns: 2fr 1.5fr 0.8fr 1.8fr;
    gap: 1rem;
    flex: 1;
    min-width: 0;
    align-items: end;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-qty {
    max-width: 120px;
}

.field-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
}

.item-total .total-value {
    padding: 1rem;
    background: rgba(76, 175, 80, 0.2);
    border-radius: 8px;
    color: white;
    font-weight: 600;
    text-align: center;
    border: 1px solid rgba(76, 175, 80, 0.3);
    font-size: 1rem;
    word-break: break-word;
    overflow: hidden;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-remove {
    padding: 0.5rem;
    background: rgba(244, 67, 54, 0.2);
    border: 1px solid rgba(244, 67, 54, 0.3);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
    min-width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    align-self: flex-end;
    margin-bottom: 0;
    position: relative;
    z-index: 1;
}

.btn-remove:hover:not(:disabled) {
    background: rgba(244, 67, 54, 0.3);
    transform: scale(1.1);
}

.btn-remove:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-add-item {
    padding: 1rem;
    background: rgba(76, 175, 80, 0.2);
    border: 2px dashed rgba(76, 175, 80, 0.5);
    border-radius: 12px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
    font-weight: 600;
}

.btn-add-item:hover {
    background: rgba(76, 175, 80, 0.3);
    border-color: rgba(76, 175, 80, 0.7);
}

.order-summary {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.summary-row:last-child {
    margin-bottom: 0;
}

.summary-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
}

.summary-value {
    color: white;
    font-size: 1.5rem;
    font-weight: 700;
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

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn {
    padding: 1rem 2rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
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

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

.spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 2px solid white;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.message {
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 12px;
    text-align: center;
    font-weight: 600;
}

.message.success {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #4caf50;
}

.message.error {
    background: rgba(244, 67, 54, 0.2);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #f44336;
}

@media (max-width: 900px) {
    .create-order {
        max-width: 100%;
        padding: 0 0.5rem;
    }

    .form-container {
        padding: 1rem;
    }

    .item-fields {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .item-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        padding: 1rem;
    }

    .field-qty {
        max-width: none;
    }

    .btn-remove {
        align-self: center;
        margin-top: 0.5rem;
        position: static;
        min-width: 40px;
        height: 40px;
    }

    .item-total .total-value {
        padding: 0.75rem;
        font-size: 0.9rem;
    }
}

@media (max-width: 768px) {
    .create-order {
        max-width: 100%;
        padding: 0 1rem;
    }

    .item-fields {
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

    .field-qty {
        max-width: none;
    }

    .item-row {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .btn-remove {
        align-self: center;
        margin-top: 0.5rem;
        position: static;
    }

    .form-actions {
        flex-direction: column;
    }

    .page-title {
        font-size: 2rem;
    }
}

@media (max-width: 1024px) and (min-width: 901px) {
    .item-fields {
        grid-template-columns: 2fr 1.2fr 0.7fr 1.5fr;
        gap: 0.75rem;
    }
    
    .field-qty {
        max-width: 100px;
    }
}

@media (max-width: 480px) {
    .form-container {
        padding: 1rem;
    }

    .item-row {
        padding: 1rem;
    }

    .page-title {
        font-size: 1.5rem;
    }
}
</style>
