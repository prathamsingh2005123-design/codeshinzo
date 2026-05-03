// Filename: Frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";

function Profile() {
  const user = useSelector((state) => state.auth?.user);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problems/problemsolvedbyuser/solved");
        setSolvedProblems(data);
      } catch (err) {
        setSolvedProblems([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSolvedProblems();
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const S = {
    page: { minHeight: "100vh", backgroundColor: "#1a1f2e", fontFamily: "sans-serif", padding: "40px 24px" },
    card: { maxWidth: "600px", margin: "0 auto", backgroundColor: "#1e2433", borderRadius: "12px", border: "1px solid #2a2f3e", padding: "32px" },
    heading: { fontSize: "24px", fontWeight: "700", color: "#f3f4f6", marginBottom: "24px", textAlign: "center" },
    section: { marginBottom: "24px" },
    label: { fontSize: "14px", color: "#9ca3af", marginBottom: "4px" },
    value: { fontSize: "16px", color: "#f3f4f6", fontWeight: "500" },
    stat: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #2a2f3e" },
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <h1 style={S.heading}>User Profile</h1>

        <div style={S.section}>
          <div style={S.stat}>
            <span style={S.label}>Name:</span>
            <span style={S.value}>{user?.firstName || "N/A"}</span>
          </div>
          <div style={S.stat}>
            <span style={S.label}>Email:</span>
            <span style={S.value}>{user?.emailId || "N/A"}</span>
          </div>
          <div style={S.stat}>
            <span style={S.label}>Role:</span>
            <span style={S.value}>{user?.role || "User"}</span>
          </div>
          <div style={S.stat}>
            <span style={S.label}>Problems Solved:</span>
            <span style={S.value}>{solvedProblems.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;