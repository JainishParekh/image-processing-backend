const logger = require("../utils/logger");
const Request = require("../models/requestModel");

const updateRequestStatus = async (
  requestId,
  status,
  processingTime,
  outputCsvUrl
) => {
  try {
    const updateBody = outputCsvUrl
      ? { status, outputCsvUrl, processingTime }
      : { status, processingTime };
    return await Request.findByIdAndUpdate(requestId, updateBody, {
      new: true,
    });
  } catch (error) {
    logger.error("Error updating status:", error);
    throw error;
  }
};

module.exports = { updateRequestStatus };
