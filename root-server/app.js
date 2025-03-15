// app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const imageRoutes = require("./routes/imageRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const logger = require("./utils/logger");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error handling for multer and other errors
app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    // A Multer error occurred when uploading
    if (err.code === "LIMIT_FILE_SIZE") {
      logger.warn("File too large:", err);
      return res
        .status(413)
        .json({ error: "File too large. Maximum size is 10MB." });
    }
    logger.warn("Multer error:", err);
    return res.status(400).json({ error: err.message });
  } else if (err.message === "Only CSV files are allowed") {
    logger.warn("Invalid file type:", err);
    return res.status(415).json({ error: err.message });
  }

  // For all other errors
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Routes
app.use("/api/csv", imageRoutes);
app.use("/webhook", webhookRoutes);

module.exports = app;
