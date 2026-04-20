require('dotenv').config();
const express = require('express');
const app = express();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// ✅ NEW
const http = require("http");
const { Server } = require("socket.io");
const initContestSocket = require("./socket/contestSocket");

// routes
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const contestRouter = require("./routes/contestRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const authRoutes = require("./routes/auth");

const port = Number(process.env.PORT) || 3000;

// ✅ CREATE SERVER (IMPORTANT)
const server = http.createServer(app);

// ✅ SOCKET SETUP
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
});

// ✅ INIT SOCKET
initContestSocket(io);

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const Initializeconnection = async () => {
    try {
        console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);

        await main();

        console.log("Connected to DB ✔");

        // ROUTES
        
        app.use("/api/user", authRouter);
        app.use("/api/problems", problemRouter);
        app.use("/api/submission", submitRouter);
        app.use("/api/contests", contestRouter);
        app.use("/api/leaderboard", leaderboardRoutes);

        // ❗ IMPORTANT CHANGE HERE
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
};

Initializeconnection();