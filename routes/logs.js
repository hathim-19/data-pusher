const express = require("express");
const { getLogs, getLog } = require("../controllers/logController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getLogs);
router.get("/:id", getLog);

module.exports = router;
