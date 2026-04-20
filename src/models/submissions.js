// Filename: src/models/submissions.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      default: null,
    },

    language: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "Wrong Answer",
    },

    testcasesPassed: {
      type: Number,
      default: 0,
    },

    totalTestcases: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);