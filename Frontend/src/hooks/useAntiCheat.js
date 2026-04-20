import { useEffect } from "react";
import socket from "../socket";

const useAntiCheat = ({ contestId, userId, isContestActive }) => {
  useEffect(() => {
    const finalUserId = userId?.toString();
    const finalContestId = contestId?.toString();

    // ❌ Jab tak sab ready nahi hai, kuch mat karo
    if (!isContestActive || !finalUserId || !finalContestId) {
      console.log("⛔ AntiCheat not active yet", {
        isContestActive,
        userId: finalUserId,
        contestId: finalContestId,
      });
      return;
    }

    console.log("🛡️ AntiCheat Active", {
      contestId: finalContestId,
      userId: finalUserId,
    });

    const sendViolation = () => {
      console.log("🚨 Tab switch detected:", {
        contestId: finalContestId,
        userId: finalUserId,
      });

      socket.emit("tabSwitch", {
        contestId: finalContestId,
        userId: finalUserId,
      });
    };

    const handleVisibility = () => {
      if (document.hidden) {
        sendViolation();
      }
    };

    window.addEventListener("blur", sendViolation);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("blur", sendViolation);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [contestId, userId, isContestActive]);
};

export default useAntiCheat;