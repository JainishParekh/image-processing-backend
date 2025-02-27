const express = require('express');
const router = express.Router();
const multer = require('multer');
const imageController = require('../controllers/imageController');
const { upload } = require('../services/s3Service');

router.post('/upload', upload.single('file'), imageController.uploadCSV);
router.get('/status/:requestId', imageController.getStatus);

module.exports = router;