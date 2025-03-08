const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify/sync");
const sharp = require("sharp");
const path = require("path");
const file = require("fs");
const stream = require("stream");
// const fetch = require("node-fetch");
const ProcessedImage = require("../models/processedImageModel");
const Request = require("../models/requestModel");
const logger = require("../utils/logger");
const { webhookUrl } = require("../config/env");
const { uploadToS3, uploadOptimizedImage } = require("./s3Service");

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
    process(file, request._id);

    return {
      requestId: request._id,
      status: "processing",
    };
  } catch (error) {
    logger.error("Error processing CSV:", error);
    throw error;
  }
};

const process = async (file, requestId) => {
  // validate the request id
  const req = await Request.findById(requestId);
  if (!req) {
    throw new Error(`Request with ID ${requestId} not incorrect`);
  }

  const parser = parse({
    columns: true,
    skip_empty_lines: true,
  });

  const records = [];
  const outputRecords = [];

  try {
    // Create a readable stream from the uploaded file buffer
    const readableFile = stream.Readable.from(file.buffer);

    // Parse the CSV file
    for await (const record of readableFile.pipe(parser)) {
      const imageUrls = record["Input Image Urls"]
        .split(",")
        .map((url) => url.trim());
      const processedUrls = [];

      // Process each image URL for the current record
      for (const url of imageUrls) {
        try {
          // Fetch the image
          const imageResponse = await fetch(url);
          if (!imageResponse.ok) {
            throw new Error(
              `Failed to fetch image: ${url}, status: ${imageResponse.status}`
            );
          }

          const imageBuffer = await imageResponse.arrayBuffer();

          // Compress the image to 50% using sharp
          const compressedImageBuffer = await sharp(Buffer.from(imageBuffer))
            .jpeg({ quality: 50 }) // Set quality to 50%
            .toBuffer();

          // Generate a unique key for S3
          const fileName = path.basename(new URL(url).pathname);
          const key = `processed/${requestId}/${Date.now()}-${fileName}`;

          // Upload the compressed image to S3
          const processedUrl = await uploadOptimizedImage(
            compressedImageBuffer,
            key
          );

          processedUrls.push(processedUrl);

          // Add entry to ProcessedImage database for each image
          await ProcessedImage.create({
            requestId,
            serialNumber: record["S. No."],
            productName: record["Product Name"],
            originalImageUrl: url,
            processedImageUrl: processedUrl,
          });
        } catch (imgError) {
          logger.error(`Error processing image ${url}:`, imgError);
          processedUrls.push("ERROR_PROCESSING_IMAGE");
        }
      }

      // Create the output record with the new column
      const outputRecord = {
        ...record,
        "Output Image Urls": processedUrls.join(", "),
      };

      records.push(record);
      outputRecords.push(outputRecord);
    }

    // Create a new CSV with the output column
    const outputCsv = stringify(outputRecords, { header: true });

    const fileBuffer = Buffer.from(outputCsv);

    // Upload the new CSV to S3
    const filePath = `processed/${requestId}-processed_results.csv`;
    const outputCsvUrl = await uploadToS3({ buffer: fileBuffer }, filePath);

    // Trigger webhook notification
    await triggerWebhook(requestId, "completed", outputCsvUrl);

    return {
      status: "success",
      message: "CSV processed successfully",
      outputCsvUrl: outputCsvUrl,
    };
  } catch (error) {
    logger.error("Error in async CSV processing:", error);
    await triggerWebhook(requestId, "failed");
    throw error;
  }
};

const triggerWebhook = async (requestId, status, outputCsvUrl) => {
  try {
    if (!webhookUrl) {
      logger.warn("No webhook URL configured, skipping notification");
      return;
    }

    const requestBody = outputCsvUrl
      ? {
          requestId: requestId,
          status: status,
          outputCsvUrl: outputCsvUrl.location,
          processingTime: new Date().toISOString(),
        }
      : {
          requestId: requestId,
          status: status,
          processingTime: new Date().toISOString(),
        };

    // Send notification to parent service
    const response = await fetch(`${webhookUrl}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to notify: ${response.status}`);
    }

    logger.info(
      `Successfully notified for request ${requestId} has been ${status}`
    );
  } catch (error) {
    logger.error(`Error notifying for request ${requestId}:`, error);
    // We don't throw the error here as this is a secondary operation
    // The main processing is already complete
  }
};

module.exports = {
  validateCSV,
  processCSV,
};
