const express = require("express");
const router = express.Router();

const { createContest, getAllContests, getContestById, deleteContest } = require("../controllers/contestController");
const { banUser, checkBanStatus, getBannedUsers } = require("../controllers/contestBanController");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

// ADMIN ONLY
router.post("/create", userMiddleware, adminMiddleware, createContest);
router.delete("/:id", userMiddleware, adminMiddleware, deleteContest);

// ── BAN ROUTES — pehle rakho /:id se ──
router.post("/ban/tabswitch", userMiddleware, banUser);
router.get("/ban/status/:contestId", userMiddleware, checkBanStatus);
router.get("/ban/all/:contestId", userMiddleware, getBannedUsers);

// ── GENERAL — baad mein ──
router.get("/", userMiddleware, getAllContests);
router.get("/:id", userMiddleware, getContestById);

module.exports = router;