// Filename: src/controllers/leaderboard.js
const Submission = require("../models/submissions");

const getLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    const board = await Submission.aggregate([
      {
        $match: {
          contestId: contestId, // 🔥 IMPORTANT
        },
      },
      {
        $group: {
          _id: "$userId",
          score: { $sum: "$score" },
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          score: 1,
          "userId.name": "$user.name",
        },
      },
    ]);

    res.json({ board });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getLeaderboard };