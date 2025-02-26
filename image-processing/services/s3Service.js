const { s3 } = require('../config/aws');
const { awsBucket } = require('../config/env');
const sharp = require('sharp');
const logger = require('../utils/logger');

class S3Service {
  async uploadOptimizedImage(imageBuffer, key) {
    try {
      // Optimize image - reduce size by 50%
      const optimizedBuffer = await sharp(imageBuffer)
        .resize({ percentage: 50 })
        .toBuffer();

      const params = {
        Bucket: awsBucket,
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg'
      };

      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      logger.error('Error uploading to S3:', error);
      throw error;
    }
  }
}

module.exports = new S3Service();