import express from "express";
import cors from "cors";
import urlRoutes from "./url/url.routes.js";
import analyticsRoutes from "./analytics/analytics.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use("/urls", urlRoutes);
app.use("/analytics", analyticsRoutes);

app.use(errorHandler);

export default app;