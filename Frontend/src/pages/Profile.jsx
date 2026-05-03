// Filename: Frontend/src/pages/Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";

function Profile() {
  const user = useSelector((state) => state.auth?.user);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problems/problemsolvedbyuser/solved");
        setSolvedProblems(data || []);
      } catch (err) {
        setError("Could not load solved problems.");
        setSolvedProblems([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSolvedProblems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const solvedCounts = useMemo(() => {
    return solvedProblems.reduce(
      (acc, problem) => {
        const difficulty = (problem.difficulty || "Easy").toLowerCase();
        if (difficulty.includes("easy")) acc.easy += 1;
        else if (difficulty.includes("medium")) acc.medium += 1;
        else if (difficulty.includes("hard")) acc.hard += 1;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );
  }, [solvedProblems]);

  const topTags = useMemo(() => {
    const counts = {};
    solvedProblems.forEach((problem) => {
      (problem.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
  }, [solvedProblems]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #2a2f3e", borderTopColor: "#a78bfa", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#1a1f2e", fontFamily: "Inter, sans-serif", padding: "32px 24px" },
    wrapper: { maxWidth: "1180px", margin: "0 auto", display: "grid", gap: "24px", gridTemplateColumns: "1.15fr 1fr" },
    panel: { background: "#1e2433", borderRadius: "24px", border: "1px solid #2a2f3e", padding: "32px" },
    largePanel: { background: "#121826", borderRadius: "24px", border: "1px solid #2a2f3e", padding: "28px" },
    avatar: { width: "92px", height: "92px", borderRadius: "24px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 700, marginBottom: "18px" },
    name: { fontSize: "26px", fontWeight: 700, color: "#f8fafc", marginBottom: "6px" },
    role: { fontSize: "13px", letterSpacing: "0.16em", textTransform: "uppercase", color: "#a5b4fc", marginBottom: "16px" },
    ratingBadge: {
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "8px 18px",
      background: "rgba(167,139,250,0.12)",
      border: "1px solid #7c3aed55",
      borderRadius: "999px",
      color: "#a78bfa", fontWeight: 700, fontSize: "17px",
      marginBottom: "22px",
    },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px", marginBottom: "24px" },
    statCard: { background: "#161d31", borderRadius: "18px", padding: "18px", border: "1px solid #2a2f3e" },
    statLabel: { color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "10px" },
    statValue: { color: "#f8fafc", fontSize: "24px", fontWeight: 700 },
    tagList: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" },
    tag: { fontSize: "12px", color: "#e2e8f0", background: "#182037", padding: "8px 14px", borderRadius: "999px" },
    listHeading: { fontSize: "20px", fontWeight: 700, color: "#f8fafc", marginBottom: "18px" },
    problemItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderRadius: "18px", background: "#161d31", border: "1px solid #2a2f3e", marginBottom: "12px", textDecoration: "none", color: "#f8fafc" },
    problemDetail: { display: "grid", gap: "6px" },
    problemTitle: { fontSize: "15px", fontWeight: 600 },
    problemMeta: { color: "#94a3b8", fontSize: "13px" },
    difficulty: { fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em" },
    emptyCard: { background: "#161d31", borderRadius: "18px", border: "1px solid #2a2f3e", padding: "28px", color: "#cbd5e1", textAlign: "center" },
    subtitle: { color: "#94a3b8", marginBottom: "22px", lineHeight: 1.6 },
  };

  const displayName = user?.firstName || "CodeShinzo User";
  const solvedCount = solvedProblems.length;
  const userRating = user?.rating ?? 0;

  return (
    <div style={S.page}>
      <div style={S.wrapper}>
        {/* Left Panel */}
        <div style={S.panel}>
          <div style={S.avatar}>{displayName.charAt(0).toUpperCase()}</div>
          <div style={S.name}>{displayName}</div>
          <div style={S.role}>{user?.role === "admin" ? "Administrator" : "Problem Solver"}</div>

          {/* Rating Badge */}
          <div style={S.ratingBadge}>⚡ Rating: {userRating}</div>

          <div style={S.subtitle}>
            Your CodeShinzo profile — track your rating and solved problems.
          </div>

          {/* Stats Grid — Easy / Medium / Hard solved */}
          <div style={S.statGrid}>
            <div style={S.statCard}>
              <div style={S.statLabel}>Easy</div>
              <div style={{ ...S.statValue, color: "#34d399" }}>{solvedCounts.easy}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Medium</div>
              <div style={{ ...S.statValue, color: "#fbbf24" }}>{solvedCounts.medium}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Hard</div>
              <div style={{ ...S.statValue, color: "#fb7185" }}>{solvedCounts.hard}</div>
            </div>
          </div>

          {/* Role + Top Tags */}
          <div style={{ marginBottom: "12px" }}>
            <span style={S.tag}>{user?.role === "admin" ? "Admin" : "User"}</span>
          </div>

          <div style={S.tagList}>
            {topTags.length ? topTags.map((tag) => (
              <span key={tag} style={S.tag}>{tag}</span>
            )) : <span style={S.tag}>No tags yet</span>}
          </div>
        </div>

        {/* Right Panel */}
        <div style={S.largePanel}>
          <div style={S.listHeading}>Solved Problems ({solvedCount})</div>

          {error && <div style={S.emptyCard}>{error}</div>}

          {!error && solvedCount === 0 && (
            <div style={S.emptyCard}>
              No solved problems yet. Head to the home page to start solving!
            </div>
          )}

          {!error && solvedProblems.map((problem) => (
            <NavLink key={problem._id} to={`/problems/${problem._id}`} style={S.problemItem}>
              <div style={S.problemDetail}>
                <div style={S.problemTitle}>{problem.title || "Untitled Problem"}</div>
                <div style={S.problemMeta}>{problem.tags?.slice(0, 3).join(" • ")}</div>
              </div>
              <span style={{ ...S.difficulty, color: problem.difficulty === "Hard" ? "#fb7185" : problem.difficulty === "Medium" ? "#fbbf24" : "#34d399" }}>
                {problem.difficulty || "Easy"}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
