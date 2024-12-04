const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect, authenticateToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

router.post(
  "/register",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isString()
      .withMessage("Name must be a string"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    validateRequest,
  ],
  authController.register
);

router.post(
  "/verify-otp",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 4, max: 6 })
      .withMessage("OTP must be between 4 and 6 digits"),
    validateRequest,
  ],
  authController.verifyOTP
);

router.post(
  "/resend-otp",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
    validateRequest,
  ],
  authController.resendOTP
);

router.post(
  "/login",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    validateRequest,
  ],
  authController.login
);

router.post(
  "/verify-login-otp",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("otp")
      .notEmpty()
      .withMessage("OTP is required")
      .isLength({ min: 4, max: 6 })
      .withMessage("OTP must be between 4 and 6 digits"),
    validateRequest,
  ],
  authController.verifyLoginOTP
);

router.post(
  "/resend-login-otp",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .isMobilePhone("id-ID")
      .withMessage("Invalid phone number format"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    validateRequest,
  ],
  authController.resendLoginOTP
);

router.get("/user-profile", protect, authController.getUserProfile);
router.post("/logout", protect, authController.logout);
router.get("/validate-token", protect, authController.validateToken);
module.exports = router;
