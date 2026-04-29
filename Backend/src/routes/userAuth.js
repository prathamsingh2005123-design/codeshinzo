// Filename: src/routes/userAuth.js
const express = require('express');
const authRouter = express.Router();
const {register,login,logout,adminRegister} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');
const {deleteProfile} = require('../controllers/userAuthent');


// register

authRouter.post("/register",register);
authRouter.post("/login",login);                
authRouter.post("/logout",logout);
authRouter.post("/admin/register",adminmiddleware, adminRegister);
authRouter.delete("/deleteprofile",userMiddleware,deleteProfile);
authRouter.get("/check-auth",userMiddleware,(req,res)=>{
    const reply={
        firstName:req.user.firstName,
        email:req.user.email,
        _id:req.user._id,
        role:req.user.role
    }
    res.status(200).json({
        reply,message:"User is authenticated"
    });
    }
);



module.exports = authRouter;