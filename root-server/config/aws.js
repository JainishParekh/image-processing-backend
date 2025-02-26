const AWS = require('aws-sdk');
const { awsRegion } = require('./env');

AWS.config.update({ region: awsRegion });

const s3 = new AWS.S3();

module.exports = {
  s3
};