const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
    },
    http_method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      default: "POST",
    },
    headers: {
      type: Map,
      of: String,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

destinationSchema.index({ account_id: 1 });

module.exports = mongoose.model("Destination", destinationSchema);
