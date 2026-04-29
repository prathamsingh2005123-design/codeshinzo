// Filename: src/utils/contestHelper.js
const { isContestLive } = require("../utils/contestHelper");

const getContestById = async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  res.json({
    contest,
    isLive: isContestLive(contest),
  });
};