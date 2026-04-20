// Filename: src/models/leaderboard.js
const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema(
  {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    solvedProblems: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem"
  }
],

    score: {
      type: Number,
      default: 0,
    },

    solvedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leaderboard", leaderboardSchema);