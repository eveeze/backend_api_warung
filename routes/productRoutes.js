const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();
const productController = require("../controllers/productController");
const validateRequest = require("../middleware/validateRequest"); // Import middleware

// Aturan validasi untuk membuat atau memperbarui produk
const productValidationRules = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("minStock")
    .isInt({ min: 0 })
    .withMessage("Minimum stock must be a non-negative integer"),
  body("producerPrice")
    .isFloat({ gt: 0 })
    .withMessage("Producer price must be a positive number"),
  body("salePrice")
    .isFloat({ gt: 0 })
    .withMessage("Sale price must be a positive number"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be 'active' or 'inactive'"),
  body("category").notEmpty().withMessage("Category is required"),
];

// Definisikan endpoint `/low-stock` dan `/search` di atas rute `/:id`

router.get(
  "/search",
  query("query").isString().withMessage("Search query must be a string"),
  validateRequest,
  productController.searchProducts
);

// Routes untuk operasi CRUD dengan validasi
router.get(
  "/",
  [
    query("category").optional().isMongoId().withMessage("Invalid category ID"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be 1 or higher"),
    query("limit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Limit must be 1 or higher"),
    query("sortStock")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("sortStock must be 'asc' or 'desc'"),
  ],
  validateRequest,
  productController.getAllProducts
);

router.get(
  "/low-stock",
  validateRequest,
  productController.getLowStockProducts
);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid product ID"),
  validateRequest,
  productController.getProductById
);

router.post(
  "/",
  productValidationRules,
  validateRequest,
  productController.createProduct
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    ...productValidationRules,
  ],
  validateRequest,
  productController.updateProduct
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid product ID"),
  validateRequest,
  productController.deleteProduct
);

router.get(
  "/category/:categoryId",
  param("categoryId").isMongoId().withMessage("Invalid category ID"),
  validateRequest,
  productController.getProductsByCategory
);

module.exports = router;
