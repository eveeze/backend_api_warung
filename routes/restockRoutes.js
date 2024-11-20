const express = require("express");
const { body } = require("express-validator");
const {
  createRestock,
  completeRestock,
} = require("../controllers/restockController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post("/create", createRestock);

router.patch(
  "/complete/:restockId",
  [
    body("restockId").notEmpty().withMessage("Restock ID is required"),
    validateRequest,
  ],
  completeRestock
);

module.exports = router;
