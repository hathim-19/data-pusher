const express = require("express");
const { receiveData } = require("../controllers/dataHandlerController");
const { accountRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/incoming_data", accountRateLimiter, receiveData);

module.exports = router;
