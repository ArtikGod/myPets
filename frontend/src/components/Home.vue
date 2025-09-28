<template>
    <div class="home">
        <div class="hero-section">
            <h1 class="hero-title"> Сервис управления заказами</h1>
            <p class="hero-subtitle">
                Создавайте заказы, отслеживайте аналитику и управляйте
                бизнесом эффективно
            </p>
        </div>

        <div class="stats-section" v-if="stats">
            <h2 class="section-title">📊 Быстрая статистика</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-number">{{ stats.totalOrders }}</div>
                    <div class="stat-label">Всего заказов</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-number">
                        {{ formatCurrency(stats.totalRevenue) }}
                    </div>
                    <div class="stat-label">Общая выручка</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-number">
                        {{ stats.totalBigOrders }}
                    </div>
                    <div class="stat-label">Крупных заказов</div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-number">
                        {{ stats.totalUniqueCustomers }}
                    </div>
                    <div class="stat-label">Уникальных клиентов</div>
                </div>
            </div>
        </div>

        <div class="weekly-section" v-if="weeklyStats">
            <h2 class="section-title">📈 За последние 7 дней</h2>
            <div class="weekly-grid">
                <div class="weekly-card">
                    <h3>Заказы</h3>
                    <div class="weekly-number">
                        {{ weeklyStats.ordersCount }}
                    </div>
                </div>

                <div class="weekly-card">
                    <h3>Выручка</h3>
                    <div class="weekly-number">
                        {{ formatCurrency(weeklyStats.totalAmount) }}
                    </div>
                </div>

                <div class="weekly-card">
                    <h3>Крупные заказы</h3>
                    <div class="weekly-number">
                        {{ weeklyStats.bigOrdersCount }}
                    </div>
                </div>

                <div class="weekly-card">
                    <h3>Клиенты</h3>
                    <div class="weekly-number">
                        {{ weeklyStats.uniqueCustomers }}
                    </div>
                </div>
            </div>
        </div>

        <div class="actions-section">
            <h2 class="section-title">⚡ Быстрые действия</h2>
            <div class="actions-grid">
                <router-link to="/orders/create" class="action-card">
                    <div class="action-icon">➕</div>
                    <div class="action-title">Создать заказ</div>
                    <div class="action-desc">
                        Добавить новый заказ в систему
                    </div>
                </router-link>

                <router-link to="/orders" class="action-card">
                    <div class="action-icon">📋</div>
                    <div class="action-title">Все заказы</div>
                    <div class="action-desc">
                        Просмотреть список всех заказов
                    </div>
                </router-link>

                <router-link to="/analytics" class="action-card">
                    <div class="action-icon">📊</div>
                    <div class="action-title">Аналитика</div>
                    <div class="action-desc">Подробная статистика и отчеты</div>
                </router-link>
            </div>
        </div>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            Загрузка данных...
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { analyticsAPI, formatUtils } from "../services/api.js";

export default {
    name: "Home",
    setup() {
        const stats = ref(null);
        const weeklyStats = ref(null);
        const loading = ref(true);

        const loadData = async () => {
            try {
                loading.value = true;

                const [summaryResponse, weeklyResponse] = await Promise.all([
                    analyticsAPI.getSummaryAnalytics(),
                    analyticsAPI.getWeeklyAnalytics(),
                ]);

                stats.value = summaryResponse.data;
                weeklyStats.value = weeklyResponse.data;
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            } finally {
                loading.value = false;
            }
        };

        const formatCurrency = (amount) => {
            return formatUtils.formatCurrency(amount);
        };

        onMounted(() => {
            loadData();
        });

        return {
            stats,
            weeklyStats,
            loading,
            formatCurrency,
        };
    },
};
</script>

<style scoped>
.home {
    max-width: 1200px;
    margin: 0 auto;
}

.hero-section {
    text-align: center;
    padding: 2rem 0;
    margin-bottom: 2rem;
}

.hero-title {
    font-size: 3rem;
    color: white;
    margin-bottom: 1rem;
    font-weight: 700;
}

.hero-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.hero-actions {
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
    backdrop-filter: blur(10px);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.section-title {
    color: white;
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
}

.stats-section {
    margin-bottom: 3rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.stat-icon {
    font-size: 2.5rem;
}

.stat-number {
    font-size: 1.6rem;
    font-weight: 700;
    color: white;
    line-height: 1.2;
    margin: 0.5rem 0;
}

.stat-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

.weekly-section {
    margin-bottom: 3rem;
}

.weekly-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.weekly-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
}

.weekly-card:hover {
    transform: translateY(-3px);
}

.weekly-card h3 {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.weekly-number {
    font-size: 1.3rem;
    font-weight: 700;
    color: white;
    line-height: 1.2;
    margin: 0.5rem 0;
}

.actions-section {
    margin-bottom: 3rem;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.action-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    text-decoration: none;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
    text-align: center;
}

.action-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.action-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.action-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.action-desc {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    color: white;
    font-size: 1.1rem;
}

.spinner {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top: 3px solid white;
    width: 30px;
    height: 30px;
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

@media (max-width: 768px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-actions {
        flex-direction: column;
        align-items: center;
    }

    .stats-grid,
    .actions-grid {
        grid-template-columns: 1fr;
    }

    .weekly-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .stat-number {
        font-size: 1.4rem;
    }

    .stat-card {
        padding: 1.5rem;
    }

    .weekly-number {
        font-size: 1.1rem;
    }
}

@media (max-width: 480px) {
    .stat-number {
        font-size: 1.2rem;
    }
    
    .stat-card {
        padding: 1rem;
        gap: 0.8rem;
    }
    
    .stat-icon {
        font-size: 2rem;
    }

    .weekly-number {
        font-size: 1rem;
    }

    .weekly-card {
        padding: 1rem;
    }
}
</style>
