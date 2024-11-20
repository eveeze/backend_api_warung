const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const validateRequest = require("../middleware/validateRequest");

router.get("/", categoryController.getAllCategories);

router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid category ID format"),
    validateRequest,
  ],
  categoryController.getCategoryById
);

router.post(
  "/",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    validateRequest,
  ],
  categoryController.createCategory
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid category ID format"),
    body("name").optional().isString().withMessage("Name must be a string"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    validateRequest,
  ],
  categoryController.updateCategory
);

router.delete(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid category ID format"),
    validateRequest,
  ],
  categoryController.deleteCategory
);

router.get(
  "/:id/products",
  [
    param("id").isMongoId().withMessage("Invalid category ID format"),
    validateRequest,
  ],
  categoryController.getProductsByCategory
);

module.exports = router;
