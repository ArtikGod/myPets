require("dotenv").config();
const express = require("express");
const bookingRoutes = require("./src/routes/bookingRoutes");
const { PORT, API_PREFIX, ROUTES } = require("./src/constants/server");

const app = express();

app.use(express.json());

app.use(`${API_PREFIX}${ROUTES.BOOKINGS}`, bookingRoutes);

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;
