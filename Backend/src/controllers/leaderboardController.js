const Leaderboard = require("../models/leaderboard");
const User = require("../models/user");

const getContestLeaderboard = async (req, res) => {
  try {
    const { contestId } = req.params;

    if (!contestId) {
      return res.status(400).json({
        success: false,
        message: "contestId required",
      });
    }

    const leaderboard = await Leaderboard.find({ contestId })
      .populate("userId", "firstName emailId rating");

    const board = leaderboard
      .map((entry) => ({
        userId: entry.userId?._id,
        name:
          entry.userId?.firstName ||
          entry.userId?.emailId ||
          "Unknown",
        rating: entry.userId?.rating || 0,
        score: entry.score,
        solved: entry.solvedCount,
      }))
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return res.status(200).json({
      success: true,
      board,
    });
  } catch (err) {
    console.log("❌ Leaderboard Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getGlobalLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select("firstName emailId rating")
      .sort({ rating: -1 })
      .limit(10);

    const board = users.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      name: u.firstName || u.emailId || "Unknown",
      rating: u.rating || 0,
    }));

    return res.status(200).json({ success: true, board });
  } catch (err) {
    console.log("❌ Global Leaderboard Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getContestLeaderboard, getGlobalLeaderboard };