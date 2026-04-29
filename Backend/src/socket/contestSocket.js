const violations = {}; // userId -> count

const initContestSocket = (io) => {
  io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // JOIN CONTEST
    socket.on("joinContest", ({ contestId, userId }) => {
     socket.join(contestId.toString());
      console.log(`User ${userId} joined contest ${contestId}`);
    });

    // TAB SWITCH DETECT
    socket.on("tabSwitch", ({ contestId, userId }) => {
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
    });

  });
};

module.exports = initContestSocket;