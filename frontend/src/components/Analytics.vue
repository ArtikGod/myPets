<template>
    <div class="analytics">
        <div class="page-header">
            <h1 class="page-title">📊 Аналитика и отчеты</h1>
            <button
                @click="refreshData"
                class="btn btn-secondary"
                :disabled="loading"
            >
                🔄 Обновить данные
            </button>
        </div>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            Загрузка аналитики...
        </div>

        <div v-else-if="error" class="error-message">
            <div class="error-icon">❌</div>
            <div class="error-text">{{ error }}</div>
            <button @click="refreshData" class="btn btn-primary">
                Попробовать снова
            </button>
        </div>

        <div v-else class="analytics-content">
            <div class="analytics-section revenue-section">
                <h2 class="section-title">💰 Выручка за последние 7 дней</h2>
                <div class="revenue-card">
                    <div class="revenue-content">
                        <div class="revenue-number">
                            {{ formatCurrency(weeklyData.totalAmount) }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 class="section-title">📊 Ключевые финансовые показатели</h2>
                <div class="financial-grid">
                    <div class="financial-card primary">
                        <div class="card-icon">💎</div>
                        <div class="card-content">
                            <div class="card-number">
                                {{ formatCurrency(summaryData.totalRevenue) }}
                            </div>
                            <div class="card-label">Общая выручка</div>
                            <div class="card-desc">За все время</div>
                        </div>
                    </div>

                    <div class="financial-card success">
                        <div class="card-icon">💳</div>
                        <div class="card-content">
                            <div class="card-number">
                                {{ formatCurrency(summaryData.averageOrderValue) }}
                            </div>
                            <div class="card-label">Средний чек</div>
                            <div class="card-desc">На один заказ</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 class="section-title">📈 Статистика заказов</h2>
                <div class="orders-grid-main">
                    <div class="analytics-card primary">
                        <div class="card-icon">📦</div>
                        <div class="card-content">
                            <div class="card-number">
                                {{ weeklyData.ordersCount }}
                            </div>
                            <div class="card-label">Заказов за неделю</div>
                        </div>
                    </div>

                    <div class="analytics-card info">
                        <div class="card-icon">📋</div>
                        <div class="card-content">
                            <div class="card-number">
                                {{ summaryData.totalOrders }}
                            </div>
                            <div class="card-label">Всего заказов</div>
                        </div>
                    </div>

                    <div class="analytics-card warning">
                        <div class="card-icon">⭐</div>
                        <div class="card-content">
                            <div class="card-number">
                                {{ weeklyData.bigOrdersCount }}
                            </div>
                            <div class="card-label">Крупных заказов</div>
                            <div class="card-percentage">
                                {{ summaryData.bigOrderPercentage }}% от общего колличества
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="clients-grid">
                    <div class="analytics-card secondary clients-card">
                        <div class="card-icon">👥</div>
                        <div class="card-content">
                            <div class="card-number">
                                {{ weeklyData.uniqueCustomers }}
                            </div>
                            <div class="card-label">Уникальных клиентов за неделю</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 class="section-title">📋 Детальная информация</h2>
                <div class="details-grid">
                    <div class="detail-card">
                        <h4 class="detail-title">💎 Крупные заказы</h4>
                        <div class="detail-stats">
                            <div class="stat-row">
                                <span class="stat-label"
                                    >Всего крупных заказов:</span
                                >
                                <span class="stat-value">{{
                                    summaryData.totalBigOrders
                                }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"
                                    >За последнюю неделю:</span
                                >
                                <span class="stat-value">{{
                                    weeklyData.bigOrdersCount
                                }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"
                                    >Процент от общего:</span
                                >
                                <span class="stat-value"
                                    >{{ summaryData.bigOrderPercentage }}%</span
                                >
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"
                                    >Минимальная сумма:</span
                                >
                                <span class="stat-value">{{
                                    formatCurrency(10000)
                                }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-card">
                        <h4 class="detail-title">👥 Клиенты</h4>
                        <div class="detail-stats">
                            <div class="stat-row">
                                <span class="stat-label"
                                    >Всего уникальных:</span
                                >
                                <span class="stat-value">{{
                                    summaryData.totalUniqueCustomers
                                }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"
                                    >За последнюю неделю:</span
                                >
                                <span class="stat-value">{{
                                    weeklyData.uniqueCustomers
                                }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"
                                    >Заказов на клиента:</span
                                >
                                <span class="stat-value">{{
                                    averageOrdersPerCustomer
                                }}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label"
                                    >Выручка на клиента:</span
                                >
                                <span class="stat-value">{{
                                    formatCurrency(averageRevenuePerCustomer)
                                }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 class="section-title">📊 Ключевые показатели</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-header">
                            <h4 class="metric-title">
                                Конверсия в крупные заказы
                            </h4>
                            <div class="metric-icon">🎯</div>
                        </div>
                        <div class="metric-value">
                            {{ summaryData.bigOrderPercentage }}%
                        </div>
                        <div class="metric-desc">
                            {{ summaryData.totalBigOrders }} из
                            {{ summaryData.totalOrders }} заказов
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-header">
                            <h4 class="metric-title">Активность за неделю</h4>
                            <div class="metric-icon">⚡</div>
                        </div>
                        <div class="metric-value">
                            {{ weeklyActivityPercentage }}%
                        </div>
                        <div class="metric-desc">
                            {{ weeklyData.ordersCount }} заказов за 7 дней
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-header">
                            <h4 class="metric-title">Средний чек недели</h4>
                            <div class="metric-icon">💳</div>
                        </div>
                        <div class="metric-value">
                            {{ formatCurrency(weeklyAverageOrder) }}
                        </div>
                        <div class="metric-desc">За последние 7 дней</div>
                    </div>
                </div>
            </div>

            <div class="update-info">
                <p>Данные обновлены: {{ formatDate(new Date()) }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { analyticsAPI, formatUtils } from "../services/api.js";

export default {
    name: "Analytics",
    setup() {
        const weeklyData = ref({
            ordersCount: 0,
            totalAmount: 0,
            bigOrdersCount: 0,
            uniqueCustomers: 0,
        });

        const summaryData = ref({
            totalOrders: 0,
            totalRevenue: 0,
            totalBigOrders: 0,
            totalUniqueCustomers: 0,
            averageOrderValue: 0,
            bigOrderPercentage: 0,
        });

        const loading = ref(true);
        const error = ref("");

        const averageOrdersPerCustomer = computed(() => {
            if (summaryData.value.totalUniqueCustomers === 0) return 0;
            return (
                Math.round(
                    (summaryData.value.totalOrders /
                        summaryData.value.totalUniqueCustomers) *
                        100
                ) / 100
            );
        });

        const averageRevenuePerCustomer = computed(() => {
            if (summaryData.value.totalUniqueCustomers === 0) return 0;
            return (
                summaryData.value.totalRevenue /
                summaryData.value.totalUniqueCustomers
            );
        });

        const weeklyActivityPercentage = computed(() => {
            if (summaryData.value.totalOrders === 0) return 0;
            return (
                Math.round(
                    (weeklyData.value.ordersCount /
                        summaryData.value.totalOrders) *
                        100 *
                        100
                ) / 100
            );
        });

        const weeklyAverageOrder = computed(() => {
            if (weeklyData.value.ordersCount === 0) return 0;
            return weeklyData.value.totalAmount / weeklyData.value.ordersCount;
        });

        const loadAnalytics = async () => {
            try {
                loading.value = true;
                error.value = "";

                const [weeklyResponse, summaryResponse] = await Promise.all([
                    analyticsAPI.getWeeklyAnalytics(),
                    analyticsAPI.getSummaryAnalytics(),
                ]);

                weeklyData.value = weeklyResponse.data;
                summaryData.value = summaryResponse.data;
            } catch (err) {
                error.value = err.message || "Ошибка при загрузке аналитики";
            } finally {
                loading.value = false;
            }
        };

        const refreshData = () => {
            loadAnalytics();
        };

        const formatCurrency = (amount) => {
            return formatUtils.formatCurrency(amount);
        };

        const formatDate = (date) => {
            return formatUtils.formatDate(date);
        };

        onMounted(() => {
            loadAnalytics();
        });

        return {
            weeklyData,
            summaryData,
            loading,
            error,
            averageOrdersPerCustomer,
            averageRevenuePerCustomer,
            weeklyActivityPercentage,
            weeklyAverageOrder,
            refreshData,
            formatCurrency,
            formatDate,
        };
    },
};
</script>

<style scoped>
.analytics {
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

.analytics-content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.analytics-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
    color: white;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    text-align: center;
}

.revenue-section {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
    border: 2px solid rgba(76, 175, 80, 0.3);
}

.revenue-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 3rem 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
    min-height: 120px;
}

.revenue-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(76, 175, 80, 0.2);
}

.revenue-icon {
    font-size: 4rem;
    filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.5));
}

.revenue-content {
    text-align: center;
    flex: 1;
}

.revenue-number {
    font-size: 3.5rem;
    font-weight: 800;
    color: #4caf50;
    margin-bottom: 0.5rem;
    text-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
    word-break: break-all;
    line-height: 1.1;
}

.revenue-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
}

.financial-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.financial-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
    min-height: 140px;
}

.financial-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.financial-card.primary {
    border-left: 6px solid #2196f3;
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05));
}

.financial-card.success {
    border-left: 6px solid #4caf50;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
}

.orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.analytics-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
    min-height: 100px;
}

.analytics-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.analytics-card.primary {
    border-left: 4px solid #2196f3;
}

.analytics-card.success {
    border-left: 4px solid #4caf50;
}

.analytics-card.warning {
    border-left: 4px solid #ff9800;
}

.analytics-card.info {
    border-left: 4px solid #9c27b0;
}

.analytics-card.secondary {
    border-left: 4px solid #607d8b;
}

.card-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
}

.card-content {
    flex: 1;
    min-width: 0;
}

.card-number {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
    word-break: break-all;
    line-height: 1.2;
}

.card-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    line-height: 1.3;
}

.card-desc {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    margin-top: 0.25rem;
}

.orders-grid-main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.clients-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

.clients-card {
    max-width: 400px;
    margin: 0 auto;
}

.card-percentage {
    color: #ff9800;
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 4px;
    text-align: center;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.summary-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
}

.summary-card:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
}

.summary-title {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.summary-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
}

.summary-desc {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.detail-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-title {
    color: white;
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

.detail-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-row:last-child {
    border-bottom: none;
}

.stat-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

.stat-value {
    color: white;
    font-weight: 600;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.metric-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
}

.metric-card:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
}

.metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.metric-title {
    color: white;
    font-size: 1rem;
    margin: 0;
}

.metric-icon {
    font-size: 1.5rem;
}

.metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: #4caf50;
    margin-bottom: 0.5rem;
}

.metric-desc {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
}

.update-info {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
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

@media (max-width: 1024px) {
    .financial-grid {
        grid-template-columns: 1fr;
    }
    
    .orders-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
    
    .revenue-number {
        font-size: 2.8rem;
    }
    
    .card-number {
        font-size: 1.6rem;
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        text-align: center;
    }

    .page-title {
        font-size: 2rem;
    }

    .revenue-card {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1.5rem;
    }
    
    .revenue-number {
        font-size: 2.5rem;
    }
    
    .revenue-label {
        font-size: 1rem;
    }

    .financial-grid,
    .orders-grid-main,
    .clients-grid,
    .summary-grid,
    .details-grid,
    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .analytics-card,
    .financial-card {
        flex-direction: column;
        text-align: center;
        padding: 1.5rem;
    }
    
    .card-number {
        font-size: 1.5rem;
    }
}

@media (max-width: 768px) {
    .orders-grid-main {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .analytics-section {
        padding: 1.5rem;
    }
    
    .revenue-number {
        font-size: 2rem;
    }
    
    .card-number {
        font-size: 1.3rem;
    }
    
    .card-icon,
    .revenue-icon {
        font-size: 2rem;
    }
    
    .section-title {
        font-size: 1.5rem;
    }
}
</style>
