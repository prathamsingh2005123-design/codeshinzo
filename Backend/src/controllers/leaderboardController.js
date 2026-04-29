const Leaderboard = require("../models/leaderboard");

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
      .populate("userId", "firstName emailId");

    const board = leaderboard
      .map((entry) => ({
        userId: entry.userId?._id,
        name:
          entry.userId?.firstName ||
          entry.userId?.emailId ||
          "Unknown",
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

module.exports = { getContestLeaderboard };