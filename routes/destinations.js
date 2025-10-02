const express = require("express");
const { body } = require("express-validator");
const {
  createDestination,
  getDestinations,
  getDestination,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");
const { protect } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validation");

const router = express.Router();

router.use(protect);

const validateDestination = [
  body("account_id").notEmpty().isMongoId(),
  body("url").isURL(),
  body("http_method").isIn(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  body("headers").isObject(),
  handleValidationErrors,
];

router.post("/", validateDestination, createDestination);
router.get("/", getDestinations);
router.get("/:id", getDestination);
router.put("/:id", validateDestination, updateDestination);
router.delete("/:id", deleteDestination);

module.exports = router;
