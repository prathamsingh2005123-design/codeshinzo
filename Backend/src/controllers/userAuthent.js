// Filename: src/controllers/userAuthent.js
const User = require('../models/user');
const validate = require('../utils/validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Submission= require('../models/submissions');


const register = async (req, res) => {
    console.log("userAuthent controller loaded");
    try {
        validate(req.body);

        const { firstName, LastName, emailId, password, ...rest } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            ...rest,
            firstName,
            LastName,
            emailId,
            role: "user",
            password: hashedPassword
        });

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId,role:"user" },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

            const reply={
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
            rating: user.rating || 0
        }

     res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3600000
});
        res.status(201).json({
            message: 'User registered successfully',
            user: reply,
            token,
        });
    } 

    
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async(req,res)=>{
    console.log("🚀 LOGIN API HIT");
    try{
        const {emailId,password} = req.body;
        if(!emailId || !password){
            throw new Error("Email and password are required");
        }
        const user = await User.findOne({emailId});
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            throw new Error("Invalid credentials");
        }
       const reply = {
    firstName: user.firstName,
    emailId: user.emailId,
    _id: user._id,
    role: user.role,
    rating: user.rating || 0
}
const token= jwt.sign({ _id: user._id ,role:user.role, emailId: user.emailId },process.env.JWT_SECRET_KEY,{expiresIn: '1h'});
res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3600000
});
     res.status(200).json({
        user: reply,
        token,
        message: "User logged in successfully",
     });

    }
    catch(error){
        res.status(401).send(error.message);
    }
}

const logout = async(req,res)=>{
    try{
       res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
       });
       res.send("User logged out successfully");
        
    }
    catch(error){
        res.status(500).send("Error logging out user");
    }
}

const adminRegister = async (req, res) => {
    try{
        validate(req.body);

        const { firstName, LastName, emailId, password, ...rest } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            ...rest,
            firstName,
            LastName,
            emailId,
            password: hashedPassword,
            role: "admin"
        });

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: "admin" },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );
     res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 3600000
});
        res.status(201).json({ message: 'Admin registered successfully', token, userId: user._id });
 
        
    }
    catch(error){
        res.status(400).json({ error: error.message });
    }
}

const deleteProfile = async(req,res)=>{
    try{
        const userId = req.user._id;
        await User.findByIdAndDelete(userId);
        // delete all submissions of the user
        await Submission.deleteMany({userId});
        res.send("User profile deleted successfully");
    }
    catch(error){
        res.status(500).json({error:"Error deleting user profile", details:error.message});
}}


module.exports = {
    register,
    login,
    logout,
    adminRegister,
    deleteProfile
};