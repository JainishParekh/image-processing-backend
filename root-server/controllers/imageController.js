const imageService = require('../services/imageService');
const logger = require('../utils/logger');

const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file provided' });
    }

    const result = await imageService.processCSV(req.file);
    res.status(202).json(result);
  } catch (error) {
    logger.error('Error in upload controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const getStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.status(200).json({
      status: request.status,
      requestId: request._id,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    });
  } catch (error) {
    logger.error('Error in status controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


module.exports = {
  uploadCSV,
  getStatus
};