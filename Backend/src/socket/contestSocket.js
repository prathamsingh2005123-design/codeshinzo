const violations = {}; // userId -> count
const Contest = require("../models/contest");

const initContestSocket = (io) => {
  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // JOIN CONTEST
    socket.on("joinContest", ({ contestId, userId }) => {
     socket.join(contestId.toString());
      console.log(`User ${userId} joined contest ${contestId}`);
    });

    // TAB SWITCH DETECT
    socket.on("tabSwitch", async ({ contestId, userId }) => {
      try {
        // Check if contest has tab switch ban enabled
        const contest = await Contest.findById(contestId);
        if (!contest || !contest.tabSwitchBanEnabled) {
          console.log(`Tab switch ignored for contest ${contestId} - not enabled`);
          return;
        }

        if (!violations[userId]) {
          violations[userId] = 0;
        }

        violations[userId]++;

        console.log(`User ${userId} violations:`, violations[userId]);

        // BROADCAST TO ALL IN CONTEST
       io.to(contestId.toString()).emit("violationUpdate", {
    userId,
    count: violations[userId],
  });
      } catch (err) {
        console.log("Tab switch error:", err);
      }
    });

  });
};

module.exports = initContestSocket;