const express = require("express");
const { param } = require("express-validator");
const {
  createRestock,
  completeRestock,
  getLowStockProducts,
  downloadReports,
} = require("../controllers/restockController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/create", createRestock);

router.patch(
  "/complete/:restockId",
  [
    param("restockId").notEmpty().withMessage("Restock ID is required"),
    validateRequest,
  ],
  completeRestock
);
router.get("/low-stock", validateRequest, getLowStockProducts);
router.get("/download-report/:filename", downloadReports);

module.exports = router;
