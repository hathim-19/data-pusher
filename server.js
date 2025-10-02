const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const connectDB = require("./config/database");
const { connectRedis } = require("./config/redis");

// Route imports
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/accounts");
const destinationRoutes = require("./routes/destinations");
const logRoutes = require("./routes/logs");
const dataHandlerRoutes = require("./routes/dataHandler");
const accountMemberRoutes = require("./routes/accountMembers");

const app = express();

// Connect to databases
connectDB();
connectRedis();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/destinations", destinationRoutes);
app.use("/api/v1/logs", logRoutes);
app.use("/api/v1/account-members", accountMemberRoutes);
app.use("/server", dataHandlerRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
