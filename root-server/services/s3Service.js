const { s3 } = require('../config/aws');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { awsBucket } = require('../config/env');

if (!awsBucket) {
  throw new Error('AWS_BUCKET environment variable is not set');
}

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: awsBucket,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

module.exports = {
  upload
};