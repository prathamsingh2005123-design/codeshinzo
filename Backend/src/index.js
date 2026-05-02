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

// ✅ CREATE SERVER
const server = http.createServer(app);

// ✅ ALL ALLOWED ORIGINS (UPDATED)
const allowedOrigins = [
  "http://localhost:5173",
  "https://codeshinzo.vercel.app",
  "https://newcodeshinzo-x8zr.vercel.app"
];

// ✅ CORS MIDDLEWARE (ONLY ONCE)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

initContestSocket(io);

app.use(express.json());
app.use(cookieParser());

const port = Number(process.env.PORT) || 3000;

const Initializeconnection = async () => {
  try {
    await main();
    console.log("Connected to DB ✔");

    // ROUTES
    app.use("/api/user", authRouter);
    app.use("/api/problems", problemRouter);
    app.use("/api/submission", submitRouter);
    app.use("/api/contests", contestRouter);
    app.use("/api/leaderboard", leaderboardRoutes);

    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};

Initializeconnection();