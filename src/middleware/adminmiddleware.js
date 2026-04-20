// Filename: src/middleware/adminmiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const adminmiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!payload?._id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(payload._id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admins only" });
    }

    req.user = user; // ONLY ONE SOURCE OF TRUTH
    next();

  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

module.exports = adminmiddleware;