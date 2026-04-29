const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    // 1. VERIFY GOOGLE TOKEN
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub } = payload;

    // 2. FIND USER
    let user = await User.findOne({ email });

    // 3. CREATE IF NOT EXISTS
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        googleId: sub,
        password: "", // google users
      });
    }

    // 4. CREATE JWT
    const authToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. RESPONSE
    res.json({
      token: authToken,
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google auth failed" });
  }
});

module.exports = router;