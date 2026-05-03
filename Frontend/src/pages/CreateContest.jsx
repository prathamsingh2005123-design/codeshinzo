import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

const CreateContest = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [tabSwitchBanEnabled, setTabSwitchBanEnabled] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axiosClient.get("/problems/getallproblems");
        setProblems(res.data);
      } catch (err) {
        // suppress problem list fetch errors from browser console
      }
    };
    fetchProblems();
  }, []);

  const toggleProblem = (id) => {
    setSelectedProblems((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        duration,
        problems: selectedProblems,
        tabSwitchBanEnabled,
      };

      if (startTime) {
        payload.startTime = new Date(startTime).toISOString();
      }

      await axiosClient.post("/contests/create", payload);
      alert("Contest Created 🚀");
      navigate("/contests");
    } catch (err) {
      alert("Failed to create contest");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = title && startTime && duration && selectedProblems.length > 0;

  const S = {
    page:     { minHeight: "100vh", backgroundColor: "#1a1f2e", fontFamily: "sans-serif", padding: "0" },
    navbar:   { borderBottom: "1px solid #2a2f3e", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    body:     { maxWidth: "720px", margin: "0 auto", padding: "32px 24px" },
    heading:  { fontSize: "22px", fontWeight: "700", color: "#f3f4f6", marginBottom: "28px" },
    label:    { display: "block", fontSize: "13px", color: "#9ca3af", marginBottom: "6px" },
    input:    { width: "100%", backgroundColor: "#252b3b", border: "1px solid #3a4050", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", color: "#f3f4f6", outline: "none", boxSizing: "border-box" },
    section:  { marginBottom: "24px" },
    card:     { backgroundColor: "#1e2433", border: "1px solid #2a2f3e", borderRadius: "12px", padding: "24px" },
    sectionH: { fontSize: "15px", fontWeight: "600", color: "#f3f4f6", marginBottom: "14px", paddingBottom: "8px", borderBottom: "1px solid #2a2f3e" },
    problem:  (selected) => ({
      padding: "12px 16px", marginBottom: "8px", cursor: "pointer",
      background: selected ? "#10b98122" : "#252b3b",
      border: `1px solid ${selected ? "#10b981" : "#3a4050"}`,
      color: selected ? "#10b981" : "#d1d5db",
      borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center",
      transition: "all 0.15s",
    }),
    submitBtn: (valid) => ({
      width: "100%", padding: "14px",
      background: valid ? "#7c3aed" : "#374151",
      border: "none", borderRadius: "10px", color: "#fff",
      fontSize: "15px", fontWeight: "600",
      cursor: valid ? "pointer" : "not-allowed",
      marginTop: "8px", opacity: valid ? 1 : 0.6,
    }),
  };

  return (
    <div style={S.page}>

      {/* Navbar */}
      <div style={S.navbar}>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <NavLink to="/" style={{ color: "#fff", fontWeight: "700", textDecoration: "none" }}>CodeShinzo</NavLink>
          <NavLink to="/contests" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px" }}>← Back to Contests</NavLink>
        </div>
      </div>

      <div style={S.body}>
        <h1 style={S.heading}>Create Contest</h1>

        <div style={S.card}>

          {/* Title */}
          <div style={S.section}>
            <label style={S.label}>Contest Title *</label>
            <input
              style={S.input}
              placeholder="e.g. Weekly Challenge #1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div style={S.section}>
            <label style={S.label}>Description (optional)</label>
            <textarea
              style={{ ...S.input, minHeight: "80px", resize: "vertical" }}
              placeholder="Contest description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Start Time + Duration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={S.label}>Start Time *</label>
              <input
                style={S.input}
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label style={S.label}>Duration (minutes) *</label>
              <input
                style={S.input}
                type="number"
                placeholder="e.g. 90"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* ── Tab Switch Ban Toggle ── */}
          <div style={{
            marginBottom: "24px",
            backgroundColor: tabSwitchBanEnabled ? "#7c3aed22" : "#252b3b",
            border: `1px solid ${tabSwitchBanEnabled ? "#7c3aed" : "#3a4050"}`,
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "all 0.2s",
          }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#f3f4f6", margin: "0 0 4px 0" }}>
                🚩 Tab Switch Detection
              </p>
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                {tabSwitchBanEnabled
                  ? "Enabled — Users will be banned if they switch tabs during contest"
                  : "Disabled — Users can freely switch tabs during contest"}
              </p>
            </div>

            {/* Toggle Switch */}
            <div
              onClick={() => setTabSwitchBanEnabled((p) => !p)}
              style={{
                width: "48px", height: "26px", borderRadius: "13px", cursor: "pointer",
                backgroundColor: tabSwitchBanEnabled ? "#7c3aed" : "#374151",
                position: "relative", transition: "background 0.2s", flexShrink: 0,
              }}
            >
              <div style={{
                width: "20px", height: "20px", borderRadius: "50%",
                backgroundColor: "#fff",
                position: "absolute", top: "3px",
                left: tabSwitchBanEnabled ? "25px" : "3px",
                transition: "left 0.2s",
              }} />
            </div>
          </div>

          {/* Problems */}
          <div style={S.section}>
            <p style={S.sectionH}>
              Select Problems *
              {selectedProblems.length > 0 && (
                <span style={{ marginLeft: "8px", fontSize: "12px", color: "#10b981", fontWeight: "400" }}>
                  {selectedProblems.length} selected
                </span>
              )}
            </p>
            {problems.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: "13px", textAlign: "center", padding: "20px" }}>
                Loading problems...
              </div>
            ) : (
              problems.map((p) => (
                <div
                  key={p._id}
                  onClick={() => toggleProblem(p._id)}
                  style={S.problem(selectedProblems.includes(p._id))}
                >
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>{p.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px",
                      backgroundColor: p.difficulty === "Easy" ? "#10b98122" : p.difficulty === "Medium" ? "#f59e0b22" : "#ef444422",
                      color: p.difficulty === "Easy" ? "#10b981" : p.difficulty === "Medium" ? "#f59e0b" : "#ef4444",
                    }}>
                      {p.difficulty}
                    </span>
                    {selectedProblems.includes(p._id) && (
                      <span style={{ fontSize: "16px" }}>✓</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleCreate}
            disabled={!isFormValid || loading}
            style={S.submitBtn(isFormValid && !loading)}
            onMouseEnter={(e) => { if (isFormValid) e.currentTarget.style.backgroundColor = "#6d28d9"; }}
            onMouseLeave={(e) => { if (isFormValid) e.currentTarget.style.backgroundColor = "#7c3aed"; }}
          >
            {loading ? "Creating..." : "🚀 Create Contest"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default CreateContest;