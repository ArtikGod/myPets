import { Router } from "express";
import { AnalyticsController } from "./analytics.controller.js";

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/:shortUrl', analyticsController.getAnalytics.bind(analyticsController));
router.post('/:shortUrl/click', analyticsController.logClick.bind(analyticsController));

export default router;