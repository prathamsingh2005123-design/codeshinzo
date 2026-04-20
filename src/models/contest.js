// Filename: src/models/contest.js
const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    // 🔥 SINGLE SOURCE OF TRUTH
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes

    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],

    organizers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contest", contestSchema);