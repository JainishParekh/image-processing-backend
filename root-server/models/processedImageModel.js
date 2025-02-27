const mongoose = require('mongoose');

const processedImageSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  serialNumber: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  originalImageUrl: {
    type: String,
    required: true
  },
  processedImageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('processed_image', processedImageSchema);