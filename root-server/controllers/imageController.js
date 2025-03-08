const { validateCSV, processCSV } = require("../services/imageService");
const { uploadToS3 } = require("../services/s3Service");
const logger = require("../utils/logger");

const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file provided" });
    }

    // validate the CSV file
    const validateResult = await validateCSV(req.file);
    if (!validateResult.isValid) {
      return res.status(400).json({
        error: validationResult.error || "Invalid CSV file",
      });
    }

    // upload the csv file to s3 bucket
    const fileName = Date.now().toString() + "-" + req.file.originalname;
    const uploadToS3Result = await uploadToS3(req.file, fileName);

    // process the CSV file
    const processResult = await processCSV(
      req.file,
      uploadToS3Result.uploadedFilename,
      uploadToS3Result.location
    );

    res.status(202).json({
      ...validateResult,
      ...processResult,
      uploadedToS3: uploadToS3Result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

const getStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json({
      status: request.status,
      requestId: request._id,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    });
  } catch (error) {
    logger.error("Error in status controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  uploadCSV,
  getStatus,
};
