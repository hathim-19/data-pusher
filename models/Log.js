const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  event_id: {
    type: String,
    unique: true,
    required: true,
  },
  account_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  destination_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Destination",
  },
  received_timestamp: {
    type: Date,
    default: Date.now,
  },
  processed_timestamp: {
    type: Date,
  },
  received_data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  error_message: {
    type: String,
  },
});

logSchema.index({ account_id: 1, received_timestamp: -1 });
logSchema.index({ event_id: 1 });

module.exports = mongoose.model("Log", logSchema);
