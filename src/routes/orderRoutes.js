const express = require("express");
const orderController = require("../controllers/orderController");
const {
    validateCreateOrder,
    validateOrderId,
} = require("../middleware/validation");

const router = express.Router();

router.post("/", validateCreateOrder, orderController.createOrder);

router.get("/:id", validateOrderId, orderController.getOrderById);

router.get("/", orderController.getAllOrders);

module.exports = router;
