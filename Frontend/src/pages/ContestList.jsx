import { useEffect, useState } from "react";
import { getContests } from "../utils/contestApi";
import { useNavigate, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";

const ContestList = () => {
 
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.reply?.role === "admin" || user?.role === "admin";

  const fetchContests = async () => {
    try {
      setLoading(true);
      const data = await getContests();
      setContests(data?.contests || []);
    } catch (err) {
      console.log(err);
      setError("Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleDelete = async (e, contestId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this contest? This cannot be undone.")) return;
    try {
      await axiosClient.delete(`/contests/${contestId}`);
      fetchContests();
    } catch (err) {
      alert("Failed to delete contest: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatus = (contest) => {
    const now = Date.now();
    const start = new Date(contest.startTime).getTime();
    const end = start + contest.duration * 60000;
    if (now < start) return "upcoming";
    if (now <= end) return "live";
    return "ended";
  };

  const StatusBadge = ({ status }) => {
    const map = {
      upcoming: { bg: "#1e40af22", color: "#60a5fa", label: "Upcoming" },
      live: { bg: "#10b98122", color: "#10b981", label: "🔴 Live" },
      ended: { bg: "#37415122", color: "#9ca3af", label: "Ended" },
    };
    const s = map[status];
    return (
      <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", backgroundColor: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
      Loading contests...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#1a1f2e", fontFamily: "sans-serif" }}>

      {/* Navbar */}
      <div style={{ borderBottom: "1px solid #2a2f3e", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <NavLink to="/" style={{ color: "#fff", fontWeight: "700", textDecoration: "none" }}>CodeShinzo</NavLink>
          <NavLink to="/" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Problems</NavLink>
          <NavLink to="/contests" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>Contests</NavLink>
          <NavLink to="/leaderboard" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>Leaderboard</NavLink>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/admin/contest")}
            style={{ padding: "8px 16px", background: "#7c3aed", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            + Create Contest
          </button>
        )}
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>

        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f3f4f6", marginBottom: "24px" }}>
          All Contests
        </h1>

        {error && (
          <div style={{ color: "#f87171", marginBottom: "16px", fontSize: "14px" }}>{error}</div>
        )}

        {contests.length === 0 ? (
          <div style={{ color: "#6b7280", textAlign: "center", padding: "80px", fontSize: "14px" }}>
            No contests available yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {contests.map((c) => {
              const status = getStatus(c);
              const start = new Date(c.startTime);
              const end = new Date(start.getTime() + c.duration * 60000);

              return (
                <div
                  key={c._id}
                  onClick={() => navigate(`/contest/${c._id}`)}
                  style={{
                    padding: "18px 20px", background: "#1e2433", border: "1px solid #2a2f3e",
                    borderRadius: "10px", cursor: "pointer", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                    transition: "background 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#242b3d"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1e2433"}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ color: "#f3f4f6", fontWeight: "600", fontSize: "15px" }}>{c.title}</span>
                      <StatusBadge status={status} />
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span>Start: {start.toLocaleString()}</span>
                      <span>•</span>
                      <span>End: {end.toLocaleString()}</span>
                      <span>•</span>
                      <span>Duration: {c.duration} min</span>
                      <span>•</span>
                      <span>{c.problems?.length || 0} problems</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "16px" }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/contest/${c._id}`)}
                      style={{
                        padding: "7px 16px", borderRadius: "6px", border: "none",
                        background: status === "live" ? "#10b981" : status === "upcoming" ? "#3b82f6" : "#374151",
                        color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer"
                      }}
                    >
                      {status === "live" ? "Join Now" : status === "upcoming" ? "View" : "View Results"}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, c._id)}
                        style={{
                          padding: "7px 14px", borderRadius: "6px", border: "none",
                          background: "#ef4444", color: "#fff", fontSize: "12px",
                          fontWeight: "600", cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestList;