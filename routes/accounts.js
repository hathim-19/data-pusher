const express = require("express");
const { body } = require("express-validator");
const {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
} = require("../controllers/accountController");
const { protect, authorize } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();

router.use(protect);

const validateAccount = [
  body("account_name").notEmpty().trim(),
  body("website").optional().isURL(),
  handleValidationErrors,
];

router.post("/", validateAccount, createAccount);
router.get("/", getAccounts);
router.get("/:id", getAccount);
router.put("/:id", validateAccount, updateAccount);
router.delete("/:id", authorize("Admin"), deleteAccount);

module.exports = router;
