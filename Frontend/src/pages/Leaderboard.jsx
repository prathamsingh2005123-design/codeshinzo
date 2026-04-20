// Filename: Frontend/src/pages/Leaderboard.jsx
import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await axiosClient.get("/leaderboard");
      setUsers(data);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1f2e",
      color: "#fff",
      padding: "40px 20px",
      fontFamily: "sans-serif"
    }}>
      
      <div style={{
        maxWidth: "900px",
        margin: "0 auto"
      }}>

        <h1 style={{
          fontSize: "26px",
          fontWeight: "700",
          marginBottom: "30px"
        }}>
          🏆 Leaderboard
        </h1>

        <div style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #2a2f3e"
        }}>

          {/* HEADER */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 150px 150px",
            padding: "16px",
            background: "#111827",
            fontWeight: "600",
            color: "#9ca3af"
          }}>
            <span>Rank</span>
            <span>User</span>
            <span>Solved</span>
            <span>Accuracy</span>
          </div>

          {/* USERS */}
          {users.map((u, i) => (
            <div key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 150px 150px",
                padding: "16px",
                borderTop: "1px solid #2a2f3e",
                background: i < 3 ? "#1e293b" : "#1e2433"
              }}
            >

              {/* Rank */}
              <span style={{
                fontWeight: "700",
                color:
                  i === 0 ? "#facc15" :
                  i === 1 ? "#cbd5f5" :
                  i === 2 ? "#f97316" :
                  "#9ca3af"
              }}>
                #{u.rank}
              </span>

              {/* Name */}
              <span>{u.name}</span>

              {/* Solved */}
              <span style={{ color: "#22c55e" }}>
                {u.solved}
              </span>

              {/* Accuracy */}
              <span style={{ color: "#60a5fa" }}>
                {u.accuracy}%
              </span>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default Leaderboard;