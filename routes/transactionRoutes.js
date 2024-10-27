// backend/routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post("/purchase", transactionController.purchaseProducts);
router.get("/profit-today", transactionController.getTodayProfit);
router.put("/update-status", transactionController.updateTransactionStatus); // Ensure function name matches the export in controller
router.get("/", transactionController.getTransactions); // Get all or filter transactions
router.get("/debtors", transactionController.getDebtors); // Get customers with debt

module.exports = router;
