const { parse } = require("csv-parse");
const Request = require("../models/requestModel");
const logger = require("../utils/logger");

const validateHeaders = (headers) => {
  const requiredHeaders = ["S. No.", "Product Name", "Input Image Urls"];
  if (headers.length !== requiredHeaders.length) {
    return {
      isValid: false,
      error: "Invalid number of headers",
    };
  }

  const allHeadersPresent = requiredHeaders.every((header) =>
    headers.includes(header)
  );
  if (!allHeadersPresent) {
    return {
      isValid: false,
      error: "Missing required headers",
    };
  }

  return { isValid: true };
};

const getCSVHeaders = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    parse(
      fileBuffer,
      { columns: true, skip_empty_lines: true },
      (err, records) => {
        if (err) return reject(err);
        if (!records || records.length === 0) {
          return reject(new Error("CSV file is empty"));
        }
        resolve(Object.keys(records[0] || {})); // Extract headers from first row
      }
    );
  });
};

const validateCSV = async (file) => {
  try {
    const headers = await getCSVHeaders(file.buffer);
    return validateHeaders(headers);
  } catch (error) {
    logger.error("Error validating CSV:", error);
    return {
      isValid: false,
      error: error.message,
    };
  }
};

const processCSV = async (file, s3Filename, s3FileLocation) => {
  try {
    const request = await Request.create({
      filename: file.originalname,
      s3Filename,
      s3Location: s3FileLocation,
    });

    // Process CSV asynchronously
    // (Your existing processing logic)

    return {
      requestId: request._id,
      status: "processing",
    };
  } catch (error) {
    logger.error("Error processing CSV:", error);
    throw error;
  }
};

module.exports = {
  validateCSV,
  processCSV,
};
