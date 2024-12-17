// backend/routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const validateRequest = require("../middleware/validateRequest");

router.post(
  "/purchase",
  validateRequest,
  transactionController.purchaseProducts,
);
router.get(
  "/profit-today",
  validateRequest,
  transactionController.getTodayProfit,
);
router.post(
  "/qris-webhook",
  validateRequest,
  transactionController.qrisWebhook,
);
router.get(
  "/qris-status/:orderId",
  validateRequest,
  transactionController.checkQRISStatus,
);
router.get("/", validateRequest, transactionController.getTransactions);
router.get(
  "/detail/:id",
  validateRequest,
  transactionController.getTransactionById,
);
router.put(
  "/update-status",
  validateRequest,
  transactionController.updateTransactionStatus,
);
router.get("/debtors", validateRequest, transactionController.getDebtors);
module.exports = router;
