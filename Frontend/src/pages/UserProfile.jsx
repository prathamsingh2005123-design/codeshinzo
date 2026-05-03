// Filename: Frontend/src/pages/UserProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosClient.get(`/user/profile/${userId}`);
        setProfile(data);
      } catch (err) {
        setError("Could not load this profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const solvedProblems = profile?.problemsSolved || [];

  const solvedCounts = useMemo(() => {
    return solvedProblems.reduce(
      (acc, problem) => {
        const d = (problem.difficulty || "Easy").toLowerCase();
        if (d.includes("easy")) acc.easy += 1;
        else if (d.includes("medium")) acc.medium += 1;
        else if (d.includes("hard")) acc.hard += 1;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );
  }, [solvedProblems]);

  const topTags = useMemo(() => {
    const counts = {};
    solvedProblems.forEach((p) => {
      (p.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
  }, [solvedProblems]);

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#1a1f2e", fontFamily: "Inter, sans-serif", padding: "0 0 48px" },
    navbar: {
      padding: "16px 40px", borderBottom: "1px solid #2a2f3e",
      display: "flex", alignItems: "center", gap: "16px",
    },
    back: {
      background: "none", border: "1px solid #374151",
      color: "#9ca3af", padding: "7px 16px", borderRadius: "8px",
      cursor: "pointer", fontSize: "13px",
    },
    brand: { color: "#a78bfa", fontWeight: 700, fontSize: "16px", cursor: "pointer" },
    wrapper: { maxWidth: "1100px", margin: "0 auto", display: "grid", gap: "24px", gridTemplateColumns: "1.1fr 1fr", padding: "32px 24px" },
    panel: { background: "#1e2433", borderRadius: "24px", border: "1px solid #2a2f3e", padding: "32px" },
    largePanel: { background: "#121826", borderRadius: "24px", border: "1px solid #2a2f3e", padding: "28px" },
    avatar: {
      width: "88px", height: "88px", borderRadius: "22px",
      background: "linear-gradient(135deg, #7c3aed, #2563eb)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "34px", fontWeight: 700, marginBottom: "18px",
    },
    name: { fontSize: "26px", fontWeight: 700, color: "#f8fafc", marginBottom: "4px" },
    role: { fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#a5b4fc", marginBottom: "20px" },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px", marginBottom: "22px" },
    statCard: { background: "#161d31", borderRadius: "16px", padding: "18px", border: "1px solid #2a2f3e" },
    statLabel: { color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" },
    statValue: { color: "#f8fafc", fontSize: "24px", fontWeight: 700 },
    tagList: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" },
    tag: { fontSize: "12px", color: "#e2e8f0", background: "#182037", padding: "7px 14px", borderRadius: "999px" },
    listHeading: { fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginBottom: "16px" },
    problemItem: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 16px", borderRadius: "14px", background: "#161d31",
      border: "1px solid #2a2f3e", marginBottom: "10px",
      textDecoration: "none", color: "#f8fafc", cursor: "pointer",
    },
    emptyCard: { background: "#161d31", borderRadius: "14px", border: "1px solid #2a2f3e", padding: "24px", color: "#6b7280", textAlign: "center" },
    ratingBadge: {
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "8px 16px",
      background: "rgba(167,139,250,0.15)",
      border: "1px solid #7c3aed44",
      borderRadius: "999px",
      color: "#a78bfa", fontWeight: 700, fontSize: "16px",
      marginBottom: "20px",
    },
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid #2a2f3e", borderTopColor: "#a78bfa", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error || !profile) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>😕</div>
        <div>{error || "Profile not found."}</div>
        <button onClick={() => navigate(-1)} style={{ marginTop: "16px", padding: "8px 20px", background: "#a78bfa", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* Navbar */}
      <div style={S.navbar}>
        <span style={S.brand} onClick={() => navigate("/")}>CodeShinzo</span>
        <button style={S.back} onClick={() => navigate("/leaderboard")}>← Leaderboard</button>
      </div>

      <div style={S.wrapper}>
        {/* Left Panel */}
        <div style={S.panel}>
          <div style={S.avatar}>{(profile.firstName || "?").charAt(0).toUpperCase()}</div>
          <div style={S.name}>{profile.firstName}</div>
          <div style={S.role}>{profile.role === "admin" ? "Administrator" : "Problem Solver"}</div>

          {/* Rating badge */}
          <div style={S.ratingBadge}>⚡ Rating: {profile.rating ?? 0}</div>

          {/* Stats Grid */}
          <div style={S.statGrid}>
            <div style={S.statCard}>
              <div style={S.statLabel}>Total Solved</div>
              <div style={S.statValue}>{solvedProblems.length}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Profile Role</div>
              <div style={{ ...S.statValue, fontSize: "14px", marginTop: "8px" }}>
                <span style={S.tag}>{profile.role === "admin" ? "Admin" : "User"}</span>
              </div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Easy Solved</div>
              <div style={{ ...S.statValue, color: "#34d399" }}>{solvedCounts.easy}</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statLabel}>Hard Solved</div>
              <div style={{ ...S.statValue, color: "#fb7185" }}>{solvedCounts.hard}</div>
            </div>
          </div>

          {/* Top Tags */}
          {topTags.length > 0 && (
            <div style={S.tagList}>
              {topTags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}
            </div>
          )}
        </div>

        {/* Right Panel - Solved Problems */}
        <div style={S.largePanel}>
          <div style={S.listHeading}>Solved Problems ({solvedProblems.length})</div>

          {solvedProblems.length === 0 ? (
            <div style={S.emptyCard}>No solved problems yet.</div>
          ) : (
            solvedProblems.map(problem => (
              <div key={problem._id} style={S.problemItem}
                onClick={() => navigate(`/problems/${problem._id}`)}
                onMouseEnter={e => e.currentTarget.style.background = "#1e2433"}
                onMouseLeave={e => e.currentTarget.style.background = "#161d31"}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{problem.title || "Untitled"}</div>
                  <div style={{ color: "#94a3b8", fontSize: "12px" }}>{problem.tags?.slice(0, 3).join(" • ")}</div>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em",
                  color: problem.difficulty === "Hard" ? "#fb7185" : problem.difficulty === "Medium" ? "#fbbf24" : "#34d399"
                }}>
                  {problem.difficulty || "Easy"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
