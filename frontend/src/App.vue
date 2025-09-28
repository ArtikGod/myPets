<template>
    <div id="app">
        <nav class="navbar">
            <div class="nav-container">
                <router-link to="/" class="nav-brand">
                    📦 Управление заказами
                </router-link>

                <div class="nav-menu">
                    <router-link to="/" class="nav-link">Главная</router-link>
                    <router-link to="/orders" class="nav-link"
                        >Заказы</router-link
                    >
                    <router-link to="/orders/create" class="nav-link"
                        >Создать заказ</router-link
                    >
                    <router-link to="/analytics" class="nav-link"
                        >Аналитика</router-link
                    >
                </div>
            </div>
        </nav>

        <main class="main-content">
            <router-view />
        </main>

        <footer class="footer">
            <div class="footer-content">
                <p>&copy; 2025 Сервис управления заказами</p>
                <div class="footer-links">
                    <span
                        class="status-indicator"
                        :class="{ online: isOnline }"
                    >
                        {{ isOnline ? "🟢 Онлайн" : "🔴 Офлайн" }}
                    </span>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { systemAPI } from "./services/api.js";

export default {
    name: "App",
    setup() {
        const isOnline = ref(false);

        const checkHealth = async () => {
            try {
                await systemAPI.getHealthCheck();
                isOnline.value = true;
            } catch (error) {
                isOnline.value = false;
            }
        };

        onMounted(() => {
            checkHealth();
            setInterval(checkHealth, 30000);
        });

        return {
            isOnline,
        };
    },
};
</script>

<style scoped>
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1rem 0;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
    transition: opacity 0.3s;
}

.nav-brand:hover {
    opacity: 0.8;
}

.nav-menu {
    display: flex;
    gap: 2rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s;
    font-weight: 500;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

.nav-link.router-link-active {
    background: rgba(255, 255, 255, 0.2);
    font-weight: 600;
}

.main-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.footer {
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1rem 0;
    margin-top: auto;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    color: white;
}

.footer-links {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.status-indicator {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    font-size: 0.9rem;
    transition: all 0.3s;
}

.status-indicator.online {
    background: rgba(76, 175, 80, 0.2);
    border: 1px solid rgba(76, 175, 80, 0.3);
}

@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem;
    }

    .nav-menu {
        gap: 1rem;
    }

    .main-content {
        padding: 1rem;
    }

    .footer-content {
        flex-direction: column;
        gap: 0.5rem;
        padding: 0 1rem;
    }
}
</style>
