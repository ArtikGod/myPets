const express = require("express");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.get("/weekly", analyticsController.getWeeklyAnalytics);

router.get("/summary", analyticsController.getSummaryAnalytics);

module.exports = router;
