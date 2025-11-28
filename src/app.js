const express = require("express");
const cors = require("cors");
const lessonsController = require("./controllers/lessonsController");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ type: "application/json", limit: "10mb" }));

app.get("/lessons", lessonsController.getLessons);

app.use(errorHandler);

module.exports = app;
