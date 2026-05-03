// Filename: src/routes/userAuth.js

const express = require('express');
const authRouter = express.Router();

// controllers (SAFE IMPORT - no destructuring)
const userController = require('../controllers/userAuthent');

// middleware
const userMiddleware = require('../middleware/userMiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');


// 🔥 DEBUG (Render pe confirm karega function load ho raha hai ya nahi)
console.log("deleteProfile check:", typeof userController.deleteProfile);


// =======================
// AUTH ROUTES
// =======================

// register
authRouter.post("/register", userController.register);

// login
authRouter.post("/login", userController.login);

// logout
authRouter.post("/logout", userController.logout);

// admin register
authRouter.post("/admin/register", adminmiddleware, userController.adminRegister);


// =======================
// DELETE PROFILE ROUTE
// =======================
// FIX: Wrap in arrow function for Express 5 compatibility
authRouter.delete("/deleteprofile", userMiddleware, (req, res) => {
    userController.deleteProfile(req, res);
});


// =======================
// AUTH CHECK ROUTE
// =======================
authRouter.get("/check-auth", userMiddleware, async (req, res) => {
    try {
        const User = require('../models/user');
        const dbUser = await User.findById(req.user._id).select('firstName emailId role rating');
        const reply = {
            firstName: dbUser.firstName,
            emailId: dbUser.emailId,
            _id: dbUser._id,
            role: dbUser.role,
            rating: dbUser.rating || 0
        };
        res.status(200).json({
            reply,
            message: "User is authenticated"
        });
    } catch (err) {
        res.status(500).json({ error: "Auth check failed" });
    }
});

// Public profile by userId
authRouter.get("/profile/:userId", userMiddleware, async (req, res) => {
    try {
        const User = require('../models/user');
        const Problem = require('../models/problem');
        const dbUser = await User.findById(req.params.userId)
            .select('firstName emailId role rating problemsSolved stats')
            .populate('problemsSolved', 'title difficulty tags');
        if (!dbUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({
            _id: dbUser._id,
            firstName: dbUser.firstName,
            emailId: dbUser.emailId,
            role: dbUser.role,
            rating: dbUser.rating || 0,
            problemsSolved: dbUser.problemsSolved || [],
            stats: dbUser.stats
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});


// export router
module.exports = authRouter;