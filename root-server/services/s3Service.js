const { s3 } = require("../config/aws");
const multer = require("multer");
const sharp = require("sharp");
const { awsBucket } = require("../config/env");
const logger = require("../utils/logger");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

if (!awsBucket) {
  throw new Error("AWS_BUCKET environment variable is not set");
}

const uploadToS3 = async (fileOrBuffer, fileName) => {
  try {
    const buffer = fileOrBuffer.buffer || fileOrBuffer;

    const uploadParams = {
      Bucket: awsBucket,
      Key: fileName,
      Body: buffer,
      ContentType: "text/csv",
    };

    const command = new PutObjectCommand(uploadParams);
    const response = await s3.send(command);

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
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

const uploadOptimizedImage = async (imageBuffer, key) => {
  try {
    // First get the metadata (this is async)
    const metadata = await sharp(imageBuffer).metadata();

    let width = Math.round(metadata.width * 0.5);

    // Safety check to ensure width is a positive number
    if (!width || isNaN(width) || width <= 0) {
      width = 800; // Default to a reasonable size if calculation fails
      logger.warn(
        `Invalid width calculation for image. Using default width of ${width}px`
      );
    }

    const optimizedBuffer = await sharp(imageBuffer)
      .resize({ width: width })
      .toBuffer();

    const params = {
      Bucket: awsBucket,
      Key: key,
      Body: optimizedBuffer,
      ContentType: "image/jpeg",
    };

    // Upload using AWS SDK v3
    await s3.send(new PutObjectCommand(params));

    // Construct and return the URL
    return `https://${awsBucket}.s3.amazonaws.com/${key}`;
  } catch (error) {
    logger.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToS3,
  uploadOptimizedImage,
};
