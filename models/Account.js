const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    account_id: {
      type: String,
      unique: true,
      required: true,
    },
    account_name: {
      type: String,
      required: [true, "Account name is required"],
    },
    app_secret_token: {
      type: String,
      unique: true,
      default: () => require("crypto").randomBytes(32).toString("hex"),
    },
    website: {
      type: String,
      default: null,
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

module.exports = mongoose.model("Account", accountSchema);
