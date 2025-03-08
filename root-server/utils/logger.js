const winston = require("winston");
const { nodeENV } = require("../config/env");
const { format, transports } = winston;

// Create a custom format for prettier console output
const consoleFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.colorize(),
  format.printf(({ timestamp, level, message, ...metadata }) => {
    let metaStr = Object.keys(metadata).length
      ? JSON.stringify(metadata, null, 2)
      : "";
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  })
);

// Initialize the logger with a console transport only
const logger = winston.createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Only create file transports in development environment
if (nodeENV === "development") {
  logger.add(
    new transports.File({
      filename: "error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  logger.add(
    new transports.File({
      filename: "combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

module.exports = logger;
