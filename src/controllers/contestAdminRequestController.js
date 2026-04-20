// Filename: src/controllers/contestAdminRequestController.js
const Request = require("../models/contestAdminRequest");

// USER REQUEST
const requestAdmin = async (req, res) => {
  const { contestId } = req.body;

  const request = await Request.create({
    userId: req.user._id,
    contestId,
  });

  res.json({ success: true, request });
};

module.exports = { requestAdmin };