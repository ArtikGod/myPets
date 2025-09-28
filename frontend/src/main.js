import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";

import Home from "./components/Home.vue";
import CreateOrder from "./components/CreateOrder.vue";
import OrderDetails from "./components/OrderDetails.vue";
import Analytics from "./components/Analytics.vue";
import OrdersList from "./components/OrdersList.vue";

const routes = [
    { path: "/", name: "Home", component: Home },
    { path: "/orders", name: "OrdersList", component: OrdersList },
    { path: "/orders/create", name: "CreateOrder", component: CreateOrder },
    {
        path: "/orders/:id",
        name: "OrderDetails",
        component: OrderDetails,
        props: true,
    },
    { path: "/analytics", name: "Analytics", component: Analytics },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
