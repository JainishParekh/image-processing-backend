// lambda.js
const serverless = require("serverless-http");
const app = require("./app");
const connectDB = require("./config/database.js");
const logger = require("./utils/logger");

// Prepare serverless handler
const handler = serverless(app);

// Export the handler function for AWS Lambda
module.exports.handler = async (event, context) => {
  // Keep Lambda from waiting for all connections to close
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDB();
  } catch (error) {
    logger.error("Failed to connect to database in Lambda handler", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database connection failed" }),
    };
  }

  // Process the request through the Express app
  return await handler(event, context);
};
