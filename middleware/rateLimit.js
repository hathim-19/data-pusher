const rateLimit = require("express-rate-limit");
const { client } = require("../config/redis");

const accountRateLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // 5 requests per second
  keyGenerator: (req) => {
    return req.account ? req.account._id.toString() : req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

module.exports = { accountRateLimiter };
