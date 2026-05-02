const Contest = require("../models/contest");

const createContest = async (req, res) => {
  try {
    const { title, startTime, duration, problems, tabSwitchBanEnabled } = req.body;

    console.log("🔥 CREATE CONTEST HIT");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const contest = await Contest.create({
      title,
      startTime,
      duration,
      problems,
      createdBy: req.user?._id,
      tabSwitchBanEnabled: tabSwitchBanEnabled || false,
    });

    console.log("✅ CONTEST CREATED:", contest._id);

    return res.json({ success: true, contest });

  } catch (err) {
    console.log("❌ CREATE CONTEST ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ createdAt: -1 });
    return res.json({ success: true, contests });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("problems");
    return res.json({ success: true, contest });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── NEW: Delete Contest ──
const deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findByIdAndDelete(id);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }
    console.log("✅ CONTEST DELETED:", id);
    return res.json({ success: true, message: "Contest deleted successfully" });
  } catch (err) {
    console.log("❌ DELETE CONTEST ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createContest, getAllContests, getContestById, deleteContest };