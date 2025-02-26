const { parse } = require('csv-parse');
const ProcessedImage = require('../models/processedImageModel');
const Request = require('../models/requestModel');
const s3Service = require('./s3Service');
const logger = require('../utils/logger');

  const validateCSV = (headers) => {
    const requiredHeaders = ['Serial Number', 'Product Name', 'Image URLs'];
    return requiredHeaders.every(header => headers.includes(header));
  }

  const processCSV = async (file) => {
    try {
      const request = await Request.create({
        filename: file.originalname
      });

      // Process CSV asynchronously
      processCSVAsync(file, request._id);

      return {
        requestId: request._id,
        status: 'accepted'
      };
    } catch (error) {
      logger.error('Error processing CSV:', error);
      throw error;
    }
  }

  const processCSVAsync = async (file, requestId) => {
    const parser = parse({
      columns: true,
      skip_empty_lines: true
    });

    try {
      for await (const record of parser) {
        const imageUrls = record['Image URLs'].split(',').map(url => url.trim());
        const processedUrls = [];

        for (const url of imageUrls) {
          const imageResponse = await fetch(url);
          const imageBuffer = await imageResponse.buffer();
          const key = `processed/${requestId}/${Date.now()}.jpg`;
          const processedUrl = await s3Service.uploadOptimizedImage(imageBuffer, key);
          processedUrls.push(processedUrl);
        }

        await ProcessedImage.create({
          requestId,
          serialNumber: record['Serial Number'],
          productName: record['Product Name'],
          originalImageUrl: record['Image URLs'],
          processedImageUrl: processedUrls.join(',')
        });
      }

      await Request.findByIdAndUpdate(requestId, { status: 'completed' });
      await triggerWebhook(requestId);
    } catch (error) {
      logger.error('Error in async CSV processing:', error);
      await Request.findByIdAndUpdate(requestId, { status: 'failed' });
    }
  }

  const triggerWebhook = async (requestId) => {
    // Implement webhook notification logic here
  }


module.exports = {
  validateCSV,
  processCSV,
};