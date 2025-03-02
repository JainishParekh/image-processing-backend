const { S3Client } = require("@aws-sdk/client-s3");
const { awsAccessKey, awsAccessSecretKey, awsRegion } = require("./env");

// Create an S3 client using v3 SDK
const s3 = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsAccessSecretKey,
  },
});

module.exports = {
  s3,
};
