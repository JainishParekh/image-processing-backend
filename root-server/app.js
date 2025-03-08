// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const imageRoutes = require("./routes/imageRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const logger = require("./utils/logger");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/csv", imageRoutes);
app.use("/webhook", webhookRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
