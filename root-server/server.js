// server.js - Only used for local development
const app = require("./app");
const connectDB = require("./config/database.config");
const { port } = require("./config/env");
const logger = require("./utils/logger");

// Connect to the database before starting the server
(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    process.exit(1);
  }
})();
