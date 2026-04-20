// Filename: src/models/contestBan.js
const mongoose = require("mongoose");

const contestBanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },
    reason: {
      type: String,
      default: "Tab switch detected",
    },
    tabSwitchCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Unique index — ek user ek contest mein sirf ek ban entry
contestBanSchema.index({ userId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model("ContestBan", contestBanSchema);