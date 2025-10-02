const express = require("express");
const { body } = require("express-validator");
const { register, login, logout } = require("../controllers/authController");
const { handleValidationErrors } = require("../middleware/validation");
const { protect } = require("../middleware/auth");

const router = express.Router();

const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  handleValidationErrors,
];

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
  handleValidationErrors,
];

router.post("/register", validateRegistration, register);
router.post("/login", validateLogin, login);
router.post("/logout", protect, logout);

module.exports = router;
