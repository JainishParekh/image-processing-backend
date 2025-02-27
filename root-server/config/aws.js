const AWS = require('aws-sdk');
const { awsAccessKey, awsAccessSecretKey, awsRegion } = require('./env');

AWS.config.update({
  accessKeyId: awsAccessKey,
  secretAccessKey: awsAccessSecretKey,
  region: awsRegion
});

const s3 = new AWS.S3();

module.exports = {
  s3
};