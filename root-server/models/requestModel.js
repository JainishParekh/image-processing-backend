const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    s3Filename: {
      type: String,
      required: true,
    },
    s3Location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("request", requestSchema);
