// backend/routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/sales", reportController.getSalesReport);
router.get("/stock", reportController.getStockReport);
router.get("/debtors", reportController.getDebtorsReport);

module.exports = router;
