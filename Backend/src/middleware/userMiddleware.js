const jwt = require("jsonwebtoken");

const userMiddleware = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = {
            _id: decoded._id,
            emailId: decoded.emailId,
            role: decoded.role
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = userMiddleware;