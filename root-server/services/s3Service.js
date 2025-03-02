const { s3 } = require("../config/aws");
const multer = require("multer");
const { awsBucket } = require("../config/env");
const logger = require("../utils/logger");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

if (!awsBucket) {
  throw new Error("AWS_BUCKET environment variable is not set");
}

const uploadToS3 = async (file) => {
  try {
    const fileName = Date.now().toString() + "-" + file.originalname;
    const uploadParams = {
      Bucket: awsBucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: "text/csv",
    };

    await s3.send(new PutObjectCommand(uploadParams));

    return {
      status: "uploaded",
      uploadedFilename: fileName,
      location: `https://${awsBucket}.s3.amazonaws.com/${fileName}`,
    };
  } catch (error) {
    // Add logic to handle the error or rethrow it automatically
    logger.error("Error uploading CSV:", error);
    throw error;
  }
};

// Configure multer for temporary local storage
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

module.exports = {
  upload,
  uploadToS3,
};
