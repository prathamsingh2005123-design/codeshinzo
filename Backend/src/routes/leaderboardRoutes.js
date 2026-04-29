const express = require("express");
const router = express.Router();

const { getContestLeaderboard } = require("../controllers/leaderboardController");
const userMiddleware = require("../middleware/userMiddleware");

// Both admin and user can access
router.get("/:contestId", userMiddleware, getContestLeaderboard);

module.exports = router;