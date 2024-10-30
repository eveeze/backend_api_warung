// backend/routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post("/purchase", transactionController.purchaseProducts);
router.get("/profit-today", transactionController.getTodayProfit);
router.post("/qris-webhook", transactionController.qrisWebhook);
router.get("/qris-status/:orderId", transactionController.checkQRISStatus);

module.exports = router;
