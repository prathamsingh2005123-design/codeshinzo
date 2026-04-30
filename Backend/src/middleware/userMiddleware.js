const userMiddleware = async (req, res, next) => {
    try {
        console.log("COOKIES:", req.cookies); // 🔥 debug

        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: "No token found" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const user = await User.findById(payload._id);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = userMiddleware;