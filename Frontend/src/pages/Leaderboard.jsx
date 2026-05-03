// Filename: Frontend/src/pages/Leaderboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#facc15", "#cbd5e1", "#f97316"];

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await axiosClient.get("/leaderboard");
        setUsers(data.board || []);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const S = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)",
      color: "#fff",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "0 0 60px",
    },
    navbar: {
      padding: "18px 40px",
      borderBottom: "1px solid #2a2f3e",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      background: "rgba(15,17,23,0.8)",
      backdropFilter: "blur(10px)",
    },
    back: {
      background: "none",
      border: "1px solid #374151",
      color: "#9ca3af",
      padding: "7px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
    },
    brand: { color: "#a78bfa", fontWeight: 700, fontSize: "16px", cursor: "pointer" },
    wrapper: { maxWidth: "780px", margin: "0 auto", padding: "48px 24px 0" },
    header: { textAlign: "center", marginBottom: "48px" },
    trophy: { fontSize: "56px", marginBottom: "16px" },
    title: {
      fontSize: "36px", fontWeight: 800,
      background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      marginBottom: "8px",
    },
    subtitle: { color: "#6b7280", fontSize: "15px" },
    table: {
      background: "rgba(30,36,51,0.6)",
      backdropFilter: "blur(12px)",
      border: "1px solid #2a2f3e",
      borderRadius: "20px",
      overflow: "hidden",
    },
    tableHead: {
      display: "grid", gridTemplateColumns: "80px 1fr 140px",
      padding: "14px 24px",
      background: "#111827",
      fontSize: "11px", fontWeight: 700,
      color: "#6b7280", letterSpacing: "0.12em", textTransform: "uppercase",
    },
    row: (i, isTop3) => ({
      display: "grid", gridTemplateColumns: "80px 1fr 140px",
      padding: "18px 24px",
      borderTop: "1px solid #1f2937",
      background: isTop3 ? "rgba(167,139,250,0.04)" : "transparent",
      cursor: "pointer",
      transition: "background 0.18s",
      alignItems: "center",
    }),
    rankCell: (i) => ({
      display: "flex", alignItems: "center", gap: "8px",
      fontSize: i < 3 ? "22px" : "15px",
      fontWeight: 700,
      color: i < 3 ? RANK_COLORS[i] : "#6b7280",
    }),
    nameCell: {
      display: "flex", alignItems: "center", gap: "12px",
    },
    avatar: (name) => ({
      width: "36px", height: "36px", borderRadius: "10px",
      background: "linear-gradient(135deg, #7c3aed, #2563eb)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "15px", fontWeight: 700, color: "#fff", flexShrink: 0,
    }),
    nameText: { fontWeight: 600, color: "#f3f4f6", fontSize: "15px" },
    ratingBadge: (rating) => ({
      display: "flex", alignItems: "center", gap: "6px",
      padding: "6px 14px",
      background: rating >= 100 ? "rgba(167,139,250,0.15)" : rating >= 50 ? "rgba(96,165,250,0.15)" : "rgba(52,211,153,0.15)",
      border: `1px solid ${rating >= 100 ? "#7c3aed44" : rating >= 50 ? "#2563eb44" : "#10b98144"}`,
      borderRadius: "999px",
      color: rating >= 100 ? "#a78bfa" : rating >= 50 ? "#60a5fa" : "#34d399",
      fontWeight: 700, fontSize: "14px",
    }),
    emptyState: {
      textAlign: "center", padding: "64px 24px",
      color: "#6b7280", fontSize: "15px",
    },
    spinner: {
      display: "flex", justifyContent: "center", alignItems: "center",
      padding: "80px",
    },
  };

  return (
    <div style={S.page}>
      {/* Navbar */}
      <div style={S.navbar}>
        <span style={S.brand} onClick={() => navigate("/")}>CodeShinzo</span>
        <button style={S.back} onClick={() => navigate("/")}>← Back</button>
      </div>

      <div style={S.wrapper}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.trophy}>🏆</div>
          <div style={S.title}>Global Leaderboard</div>
          <div style={S.subtitle}>Top 10 coders ranked by contest rating</div>
        </div>

        {/* Table */}
        <div style={S.table}>
          <div style={S.tableHead}>
            <span>Rank</span>
            <span>Coder</span>
            <span>Rating</span>
          </div>

          {loading ? (
            <div style={S.spinner}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                border: "3px solid #2a2f3e", borderTopColor: "#a78bfa",
                animation: "spin 0.7s linear infinite"
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : users.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>😴</div>
              No users on the leaderboard yet. Be the first!
            </div>
          ) : (
            users.map((u, i) => {
              const isTop3 = i < 3;
              return (
                <div
                  key={u.userId}
                  style={S.row(i, isTop3)}
                  onClick={() => navigate(`/profile/${u.userId}`)}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(167,139,250,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = isTop3 ? "rgba(167,139,250,0.04)" : "transparent"}
                >
                  {/* Rank */}
                  <div style={S.rankCell(i)}>
                    {i < 3 ? MEDAL[i] : `#${u.rank}`}
                  </div>

                  {/* Name */}
                  <div style={S.nameCell}>
                    <div style={S.avatar(u.name)}>
                      {(u.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <span style={S.nameText}>{u.name}</span>
                  </div>

                  {/* Rating */}
                  <div style={S.ratingBadge(u.rating)}>
                    ⚡ {u.rating}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;