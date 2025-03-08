const express = require("express");
const router = express.Router();
const { statusUpdate } = require("../controllers/webhookController");

router.put("/status", statusUpdate);

module.exports = router;
