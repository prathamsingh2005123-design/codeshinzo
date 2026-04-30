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
authRouter.get("/check-auth", userMiddleware, (req, res) => {
    const reply = {
        firstName: req.user.firstName,
        email: req.user.email,
        _id: req.user._id,
        role: req.user.role
    };

    res.status(200).json({
        reply,
        message: "User is authenticated"
    });
});


// export router
module.exports = authRouter;