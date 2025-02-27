const dotenv = require('dotenv');
dotenv.config();

console.log("Environment Variables:");
console.log("AWS_BUCKET:", process.env.AWS_BUCKET);
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY);
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("PORT:", process.env.PORT);
console.log("WEBHOOK_URL:", process.env.WEBHOOK_URL);

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/image-processor',
  awsRegion: process.env.AWS_REGION,
  awsBucket: process.env.AWS_BUCKET,
  webhookUrl: process.env.WEBHOOK_URL,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  awsAccessSecretKey: process.env.AWS_SECRET_ACCESS_KEY
};