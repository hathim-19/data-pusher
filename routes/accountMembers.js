const express = require("express");
const { body } = require("express-validator");
const {
  inviteMember,
  getAccountMembers,
  updateMemberRole,
  removeMember,
} = require("../controllers/accountMemberController");
const { protect } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();

router.use(protect);

const validateInvite = [
  body("account_id").isMongoId(),
  body("user_email").isEmail().normalizeEmail(),
  body("role_name").isIn(["Admin", "Normal User"]),
  handleValidationErrors,
];

const validateUpdateRole = [
  body("role_name").isIn(["Admin", "Normal User"]),
  body("account_id").isMongoId(),
  handleValidationErrors,
];

router.post("/invite", validateInvite, inviteMember);
router.get("/", getAccountMembers);
router.put("/:id", validateUpdateRole, updateMemberRole);
router.delete("/:id", removeMember);

module.exports = router;
