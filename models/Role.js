const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    role_name: {
      type: String,
      required: true,
      enum: ["Admin", "Normal User"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Role", roleSchema);
