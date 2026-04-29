// Filename: src/controllers/contestBanController.js
const ContestBan = require("../models/contestBan");
const Contest = require("../models/contest");

/* =========================
   BAN USER (tab switch)
========================= */
const banUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contestId } = req.body;

    if (!contestId) {
      return res.status(400).json({ success: false, message: "contestId required" });
    }

    // Contest exist karta hai check karo
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    // Agar pehle se ban hai toh tabSwitchCount badhao
    const existing = await ContestBan.findOne({ userId, contestId });

    if (existing) {
      existing.tabSwitchCount += 1;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: "Tab switch count updated",
        ban: existing,
        tabSwitchCount: existing.tabSwitchCount,
      });
    }

    // Naya ban create karo
    const ban = await ContestBan.create({
      userId,
      contestId,
      reason: "Tab switch detected",
      tabSwitchCount: 1,
    });

    console.log(`🚩 User ${userId} banned from contest ${contestId}`);

    return res.status(200).json({
      success: true,
      message: "User banned from contest due to tab switch",
      ban,
      tabSwitchCount: 1,
    });

  } catch (err) {
    console.log("BAN ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   CHECK BAN STATUS
========================= */
const checkBanStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { contestId } = req.params;

    const ban = await ContestBan.findOne({ userId, contestId });

    return res.status(200).json({
      success: true,
      isBanned: !!ban,
      tabSwitchCount: ban?.tabSwitchCount || 0,
      ban: ban || null,
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   GET ALL BANNED USERS (for leaderboard flag)
========================= */
const getBannedUsers = async (req, res) => {
  try {
    const { contestId } = req.params;

    const bans = await ContestBan.find({ contestId })
      .populate("userId", "firstName emailId");

    return res.status(200).json({
      success: true,
      bans,
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { banUser, checkBanStatus, getBannedUsers };