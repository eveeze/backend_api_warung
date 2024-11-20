const express = require("express");
const { body } = require("express-validator");
const {
  createRestock,
  completeRestock,
} = require("../controllers/restockController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/create",
  [
    body("products").isArray().withMessage("Products must be an array"),
    body("products.*.productId")
      .notEmpty()
      .withMessage("Product ID is required"),
    body("products.*.newStock")
      .isInt({ min: 1 })
      .withMessage("New stock must be at least 1"),
    validateRequest,
  ],
  createRestock
);

router.patch(
  "/complete/:restockId",
  [
    body("restockId").notEmpty().withMessage("Restock ID is required"),
    validateRequest,
  ],
  completeRestock
);

module.exports = router;
