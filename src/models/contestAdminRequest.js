// Filename: src/models/contestAdminRequest.js
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContestAdminRequest", requestSchema);