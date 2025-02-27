const { parse } = require('csv-parse');
const Request = require('../models/requestModel');
const logger = require('../utils/logger');

const validateHeaders = (headers) => {
  const requiredHeaders = ['S. No.', 'Product Name', 'Input Image Urls'];
  if (headers.length !== requiredHeaders.length) {
    throw new Error('Invalid number of headers');
  }
  return requiredHeaders.every(header => headers.includes(header));
}

const getCSVHeaders = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    parse(fileBuffer, { columns: true, skip_empty_lines: true }, (err, records) => {
      if (err) return reject(err);
      resolve(Object.keys(records[0] || {})); // Extract headers from first row
    });
  });
};


const processCSV = async (file) => {
  try {
    const request = await Request.create({
      filename: file.originalname
    });

    const headers = await getCSVHeaders(file.buffer);

    if (!validateHeaders(headers)) {
      throw new Error('Invalid CSV headers');
    }

    // Process CSV asynchronously using a separate function
    // processCSVAsync(file, request._id);

    return {
      requestId: request._id,
      status: 'processing'
    };
  } catch (error) {
    logger.error('Error processing CSV:', error);
    throw error;
  }
}

module.exports = {
  processCSV
};