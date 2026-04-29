// Filename: src/routes/userAuth.js
const express = require('express');
const authRouter = express.Router();
const {register,login,logout,adminRegister} = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');
const userController = require('../controllers/userAuthent.js');

authRouter.delete(
  "/deleteprofile",
  userMiddleware,
  userController.deleteProfile
);

// register

authRouter.post("/register",register);
authRouter.post("/login",login);                
authRouter.post("/logout",logout);
authRouter.post("/admin/register",adminmiddleware, adminRegister);
const userController = require('../controllers/userAuthent.js');

console.log("deleteProfile check:", typeof userController.deleteProfile);

authRouter.delete(
  "/deleteprofile",
  userMiddleware,
  userController.deleteProfile
);
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



module.exports = authRouter;const express = require('express');
const authRouter = express.Router();

const { register, login, logout, adminRegister } = require('../controllers/userAuthent');
const userMiddleware = require('../middleware/userMiddleware');
const adminmiddleware = require('../middleware/adminmiddleware');

const userController = require('../controllers/userAuthent.js');

console.log("deleteProfile check:", typeof userController.deleteProfile);

// register
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/admin/register", adminmiddleware, adminRegister);

// delete profile (ONLY ONCE)
authRouter.delete(
  "/deleteprofile",
  userMiddleware,
  userController.deleteProfile
);

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

module.exports = authRouter;