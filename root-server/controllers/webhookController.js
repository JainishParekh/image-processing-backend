const { updateRequestStatus } = require("../services/webhookService");
const logger = require("../utils/logger");
const Request = require("../models/requestModel");

const statusUpdate = async (req, res) => {
  try {
    const { requestId, status, outputCsvUrl, processingTime } = req.body;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const updatedRequest = await updateRequestStatus(
      requestId,
      status,
      processingTime,
      outputCsvUrl
    );

    return res.status(200).json({
      status: updatedRequest.status,
      requestId: updatedRequest._id,
    });
  } catch (error) {
    logger.error("Error getting status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  statusUpdate,
};
