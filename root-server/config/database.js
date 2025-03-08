// database.config.js
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { mongoUri } = require("./env");

// Track connection state
let connection = null;

const connectDB = async () => {
  // Reuse existing connection if it exists
  if (connection && mongoose.connection.readyState === 1) {
    logger.info("Using existing MongoDB connection");
    return connection;
  }

  try {
    connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // These settings help with Lambda's serverless nature
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    logger.info("MongoDB connected successfully");
    return connection;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error; // Don't exit process in Lambda environment
  }
};

module.exports = connectDB;
