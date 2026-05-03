const express = require("express");
const router = express.Router();

const { getContestLeaderboard, getGlobalLeaderboard } = require("../controllers/leaderboardController");
const userMiddleware = require("../middleware/userMiddleware");

// Global top-10 by rating
router.get("/", userMiddleware, getGlobalLeaderboard);

// Contest-specific leaderboard
router.get("/:contestId", userMiddleware, getContestLeaderboard);

module.exports = router;