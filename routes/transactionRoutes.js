// backend/routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post("/purchase", transactionController.purchaseProducts);
router.get("/profit-today", transactionController.getTodayProfit);

module.exports = router;
