// Filename: src/middleware/userMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const userMiddleware = async (req, res, next) => {
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({error: "Unauthorized"});
        }
       const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
       const {_id}= payload;
       if(!_id){
        return res.status(401).json({error: "Unauthorized"});
       }
       const user = await User.findById(_id);
       if(!user){
        return res.status(401).json({error: "Unauthorized"});
       }
         req.result = user;
         req.user = user;
            next();}

catch(error){
        return res.status(401).json({error: error.message});
    }
}

module.exports = userMiddleware;