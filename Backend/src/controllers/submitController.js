// Filename: src/controllers/submitController.js
const Submission = require("../models/submissions");
const Leaderboard = require("../models/leaderboard");
const Problem = require("../models/problem");
const mongoose = require("mongoose");

const submitCode = async (req, res) => {
  console.log("🔥 SUBMIT CONTROLLER HIT");
  console.log("🚀 SUBMIT API HIT");
  console.log("🔥 contestId =", contestId);
console.log("🔥 userId =", req.user._id);
  const { problemId, code, language, contestId } = req.body;

  const normalizedProblemId = new mongoose.Types.ObjectId(problemId);

  const problem = await Problem.findById(problemId);

  const submission = await Submission.create({
    userId: req.user._id,
    problemId,
    contestId,
    code,
    language,
  });

  const verdict = "Accepted";

  const scoreMap = {
    easy: 100,
    medium: 200,
    hard: 300,
  };

  const score = scoreMap[problem.difficulty.toLowerCase()] || 0;

  if (contestId && verdict === "Accepted") {
    let entry = await Leaderboard.findOne({
      contestId,
      userId: req.user._id,
    });

    if (!entry) {
      entry = await Leaderboard.create({
        contestId,
        userId: req.user._id,
        score: 0,
        solvedCount: 0,
        solvedProblems: [],
      });
    }

    // 🔥 IMPORTANT FIX
    const alreadySolved = entry.solvedProblems.some(
      (p) => p.toString() === normalizedProblemId.toString()
    );

    if (!alreadySolved) {
      entry.solvedProblems.push(normalizedProblemId);
      entry.score += score;
      entry.solvedCount += 1;
      await entry.save(); // save ONLY when updated
    }
  }

  res.json({
    success: true,
    message: "Submitted successfully",
    submission,
  });
};

module.exports = { submitCode };