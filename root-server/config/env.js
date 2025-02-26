const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/image-processor',
  awsRegion: process.env.AWS_REGION,
  awsBucket: process.env.AWS_BUCKET,
  webhookUrl: process.env.WEBHOOK_URL
};