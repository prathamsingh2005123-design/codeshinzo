import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { getContest } from "../utils/contestApi";
import Editor from "@monaco-editor/react";
import axiosClient from "../utils/axiosClient";

const LANGUAGE_MAP = {
  "C++": "cpp",
  JavaScript: "javascript",
  Python: "python",
  Java: "java",
};

const ContestPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [contest, setContest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState("// Select a problem to start coding");
  const [leaderboard, setLeaderboard] = useState([]);
  const [result, setResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("problems");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState("C++");
  const [timeLeft, setTimeLeft] = useState("");
  const [contestStatus, setContestStatus] = useState("upcoming");

  // ── Ban State ──
  const [isBanned, setIsBanned] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showBanAlert, setShowBanAlert] = useState(false);
  const [bannedUsers, setBannedUsers] = useState([]);
  const tabSwitchRef = useRef(false); // prevent duplicate calls

  // ── Fetch Contest ──
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const data = await getContest(id);
        setContest(data.contest);
      } catch (err) {
        console.log("Contest Fetch Error:", err);
      }
    };
    fetchContest();
  }, [id]);

  // ── Check Ban Status on Load ──
  useEffect(() => {
    if (!id) return;
    const checkBan = async () => {
      try {
        const res = await axiosClient.get(`/contests/ban/status/${id}`);
        if (res.data.isBanned) {
          setIsBanned(true);
          setTabSwitchCount(res.data.tabSwitchCount);
        }
      } catch (err) {
        console.log("Ban check error:", err);
      }
    };
    checkBan();
  }, [id]);

  // ── Timer ──
  useEffect(() => {
    if (!contest) return;
    const tick = () => {
      const now = Date.now();
      const start = new Date(contest.startTime).getTime();
      const end = start + contest.duration * 60000;
      if (now < start) {
        setContestStatus("upcoming");
        const diff = start - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`Starts in ${h}h ${m}m ${s}s`);
      } else if (now <= end) {
        setContestStatus("live");
        const diff = end - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s left`);
      } else {
        setContestStatus("ended");
        setTimeLeft("Contest Ended");
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  // ── Tab Switch Detection ──
const handleVisibilityChange = useCallback(async () => {
  // ── Check if tab switch ban is enabled for this contest ──
  if (!contest?.tabSwitchBanEnabled) return; // ← NEW CHECK

  if (contestStatus !== "live" || isBanned || tabSwitchRef.current) return;
  if (document.hidden) {
    tabSwitchRef.current = true;
    try {
      const res = await axiosClient.post("/contests/ban/tabswitch", {
        contestId: id,
      });
      setIsBanned(true);
      setTabSwitchCount(res.data.tabSwitchCount || 1);
      setShowBanAlert(true);
    } catch (err) {
      console.log("Tab switch ban error:", err);
    } finally {
      tabSwitchRef.current = false;
    }
  }
}, [contestStatus, isBanned, id, contest?.tabSwitchBanEnabled]); // ← dependency add

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // ── Live Leaderboard + Banned Users Polling ──
  useEffect(() => {
    if (!contest?._id) return;

    const fetchLeaderboard = async () => {
      try {
        const res = await axiosClient.get(`/leaderboard/${contest._id}`);
        setLeaderboard(res.data.board || []);
      } catch (err) {
        console.log("Leaderboard Error:", err);
      }
    };

    const fetchBannedUsers = async () => {
      try {
        const res = await axiosClient.get(`/contests/ban/all/${contest._id}`);
        setBannedUsers(res.data.bans || []);
      } catch (err) {
        console.log("Banned users error:", err);
      }
    };

    fetchLeaderboard();
    fetchBannedUsers();
    const interval = setInterval(() => {
      fetchLeaderboard();
      fetchBannedUsers();
    }, 5000);
    return () => clearInterval(interval);
  }, [contest?._id, result]);

  const isActive = contestStatus === "live" && !isBanned;
  const isAdmin = user?.reply?.role === "admin" || user?.role === "admin";

  const isBannedUser = (userId) => {
    return bannedUsers.some(
      (b) => b.userId?._id?.toString() === userId?.toString()
    );
  };

  // ── Run Code ──
  const handleRun = async () => {
    if (!selectedProblem) return alert("Select a problem first");
    if (isBanned) return alert("You are banned from this contest due to tab switching");
    if (!isActive) return alert(contestStatus === "upcoming" ? "Contest hasn't started yet" : "Contest has ended");

    setRunning(true);
    setActiveRightTab("result");
    setResult(null);
    try {
      const res = await axiosClient.post(`/problems/run/${selectedProblem._id}`, { code, language });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || err.message });
    } finally {
      setRunning(false);
    }
  };

  // ── Submit Code ──
  const handleSubmit = async () => {
    if (!selectedProblem) return alert("Select a problem first");
    if (isBanned) return alert("You are banned from this contest due to tab switching");
    if (!isActive) return alert(contestStatus === "upcoming" ? "Contest hasn't started yet" : "Contest has ended");

    setSubmitting(true);
    setActiveRightTab("result");
    setResult(null);
    try {
      const res = await axiosClient.post(`/problems/submit/${selectedProblem._id}`, {
        code,
        language,
        contestId: contest._id,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s) => {
    if (s === "Accepted") return "#10b981";
    if (s === "Wrong Answer") return "#ef4444";
    return "#f59e0b";
  };

  if (!contest) return (
    <div style={{ minHeight: "100vh", background: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
      Loading contest...
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#1a1f2e", fontFamily: "sans-serif", overflow: "hidden" }}>

      {/* ── BAN ALERT MODAL ── */}
      {showBanAlert && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            backgroundColor: "#1e2433", border: "2px solid #ef4444",
            borderRadius: "16px", padding: "32px", maxWidth: "440px", textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚩</div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#ef4444", marginBottom: "12px" }}>
              Tab Switch Detected!
            </h2>
            <p style={{ fontSize: "14px", color: "#d1d5db", lineHeight: "1.7", marginBottom: "20px" }}>
              You switched tabs during the contest. You have been <strong style={{ color: "#ef4444" }}>banned</strong> from submitting code for the remainder of this contest.
            </p>
            <div style={{
              backgroundColor: "#ef444422", border: "1px solid #ef444444",
              borderRadius: "8px", padding: "12px", marginBottom: "20px", fontSize: "13px", color: "#f87171"
            }}>
              Tab switches detected: <strong>{tabSwitchCount}</strong>
            </div>
            <button
              onClick={() => setShowBanAlert(false)}
              style={{
                padding: "10px 24px", backgroundColor: "#ef4444", border: "none",
                borderRadius: "8px", color: "#fff", fontWeight: "600", fontSize: "14px", cursor: "pointer"
              }}
            >
              I understand
            </button>
          </div>
        </div>
      )}

      {/* ── BANNED BANNER ── */}
      {isBanned && contestStatus === "live" && (
        <div style={{
          backgroundColor: "#ef444422", borderBottom: "1px solid #ef4444",
          padding: "8px 20px", textAlign: "center", fontSize: "13px",
          color: "#f87171", fontWeight: "600", flexShrink: 0
        }}>
          🚩 You are banned from this contest due to tab switching. Tab switches: {tabSwitchCount}
        </div>
      )}

      {/* ── NAVBAR ── */}
      <div style={{ height: "50px", background: "#0b1220", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <NavLink to="/" style={{ color: "#a78bfa", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>
          CodeShinzo
        </NavLink>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            fontSize: "13px", fontWeight: "600", padding: "4px 12px", borderRadius: "20px",
            backgroundColor: isActive ? "#10b98122" : contestStatus === "ended" ? "#ef444422" : "#3b82f622",
            color: isActive ? "#10b981" : contestStatus === "ended" ? "#ef4444" : "#60a5fa"
          }}>
            {contestStatus === "live" && "🔴 "}{timeLeft}
          </span>

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              if (selectedProblem) {
                const starter = selectedProblem.starterCode?.find(s => s.language === e.target.value);
                if (starter?.intialCode) setCode(starter.intialCode);
              }
            }}
            style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #334155", background: "#111827", color: "white", fontSize: "12px", cursor: "pointer", outline: "none" }}
          >
            {["C++", "JavaScript", "Python", "Java"].map(l => <option key={l}>{l}</option>)}
          </select>

          <button
            onClick={handleRun}
            disabled={!isActive || running || submitting}
            style={{
              padding: "6px 16px", borderRadius: "6px", border: "1px solid #3b82f6",
              background: isActive ? "#2563eb" : "#374151", color: "white", fontWeight: "600",
              fontSize: "12px", cursor: isActive ? "pointer" : "not-allowed", opacity: isActive ? 1 : 0.5
            }}
          >
            {running ? "Running..." : "Run"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isActive || running || submitting}
            style={{
              padding: "6px 16px", borderRadius: "6px", border: "none",
              background: isActive ? "#10b981" : "#374151", color: "white", fontWeight: "600",
              fontSize: "12px", cursor: isActive ? "pointer" : "not-allowed", opacity: isActive ? 1 : 0.5
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{ width: "40%", display: "flex", flexDirection: "column", borderRight: "1px solid #2a2f3e", overflow: "hidden" }}>

          <div style={{ padding: "12px 16px", background: "#1e2433", borderBottom: "1px solid #2a2f3e", flexShrink: 0 }}>
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#f3f4f6", margin: 0 }}>{contest.title}</h2>
            {contest.description && (
              <p style={{ fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" }}>{contest.description}</p>
            )}
          </div>

          <div style={{ display: "flex", background: "#1e2433", borderBottom: "1px solid #2a2f3e", flexShrink: 0 }}>
            {["problems", "leaderboard"].map(tab => (
              <button key={tab}
                onClick={() => setActiveLeftTab(tab)}
                style={{
                  padding: "10px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer",
                  background: "none", border: "none",
                  color: activeLeftTab === tab ? "#f3f4f6" : "#6b7280",
                  borderBottom: activeLeftTab === tab ? "2px solid #a78bfa" : "2px solid transparent"
                }}>
                {tab === "problems" ? "Problems" : "🏆 Leaderboard"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>

            {/* Problems Tab */}
            {activeLeftTab === "problems" && (
              <div>
                {selectedProblem ? (
                  <div style={{ padding: "16px" }}>
                    <button
                      onClick={() => setSelectedProblem(null)}
                      style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: "12px", marginBottom: "12px", padding: 0 }}
                    >
                      ← Back to problems
                    </button>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#f3f4f6", marginBottom: "8px" }}>{selectedProblem.title}</h3>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <span style={{
                        padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                        backgroundColor: selectedProblem.difficulty === "Easy" ? "#10b98122" : selectedProblem.difficulty === "Medium" ? "#f59e0b22" : "#ef444422",
                        color: selectedProblem.difficulty === "Easy" ? "#10b981" : selectedProblem.difficulty === "Medium" ? "#f59e0b" : "#ef4444"
                      }}>
                        {selectedProblem.difficulty}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#d1d5db", lineHeight: "1.7", marginBottom: "16px" }}>
                      {selectedProblem.description}
                    </p>
                    {selectedProblem.visibletestcases?.map((tc, i) => (
                      <div key={i} style={{ marginBottom: "12px" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#f3f4f6", marginBottom: "6px" }}>Example {i + 1}:</p>
                        <div style={{ backgroundColor: "#252b3b", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#d1d5db", lineHeight: "1.8" }}>
                          <div><span style={{ color: "#9ca3af" }}>Input: </span>{tc.input}</div>
                          <div><span style={{ color: "#9ca3af" }}>Output: </span>{tc.output}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "12px" }}>
                    {!contest.problems || contest.problems.length === 0 ? (
                      <div style={{ color: "#6b7280", textAlign: "center", padding: "40px", fontSize: "13px" }}>No problems added yet.</div>
                    ) : (
                      contest.problems.map((p, i) => (
                        <div key={p._id}
                          onClick={() => {
                            setSelectedProblem(p);
                            const starter = p.starterCode?.find(s => s.language === language);
                            setCode(starter?.intialCode || `// Write your ${language} solution here`);
                            setResult(null);
                          }}
                          style={{
                            padding: "14px 16px", background: "#1e2433", border: "1px solid #2a2f3e",
                            borderRadius: "8px", marginBottom: "8px", cursor: "pointer"
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#242b3d"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1e2433"}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "#f3f4f6", fontWeight: "500", fontSize: "14px" }}>
                              {i + 1}. {p.title}
                            </span>
                            <span style={{
                              fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px",
                              backgroundColor: p.difficulty === "Easy" ? "#10b98122" : p.difficulty === "Medium" ? "#f59e0b22" : "#ef444422",
                              color: p.difficulty === "Easy" ? "#10b981" : p.difficulty === "Medium" ? "#f59e0b" : "#ef4444"
                            }}>
                              {p.difficulty}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeLeftTab === "leaderboard" && (
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <p style={{ fontSize: "14px", fontWeight: "600", color: "#f3f4f6", margin: 0 }}>Contest Leaderboard</p>
                  <span style={{ fontSize: "11px", color: contestStatus === "live" ? "#10b981" : "#6b7280" }}>
                    {contestStatus === "live" ? "🔴 Live • updates every 5s" : "Final"}
                  </span>
                </div>

                {leaderboard.length === 0 ? (
                  <div style={{ color: "#6b7280", textAlign: "center", padding: "40px", fontSize: "13px" }}>
                    No participants yet.
                  </div>
                ) : (
                  <>
                    <div style={{
                      display: "grid", gridTemplateColumns: "44px 1fr 50px 60px 40px",
                      padding: "8px 12px", background: "#111827", borderRadius: "6px",
                      marginBottom: "6px", fontSize: "11px", color: "#9ca3af", fontWeight: "600"
                    }}>
                      <span>Rank</span>
                      <span>Name</span>
                      <span style={{ textAlign: "center" }}>Solved</span>
                      <span style={{ textAlign: "center" }}>Score</span>
                      <span style={{ textAlign: "center" }}>Flag</span>
                    </div>

                    {leaderboard.map((entry, i) => {
                      const banned = isBannedUser(entry.userId);
                      return (
                        <div key={entry.userId?.toString() || i}
                          style={{
                            display: "grid", gridTemplateColumns: "44px 1fr 50px 60px 40px",
                            padding: "10px 12px", background: banned ? "#ef444411" : "#1e2433",
                            border: `1px solid ${banned ? "#ef444444" : "#2a2f3e"}`,
                            borderRadius: "8px", marginBottom: "6px", fontSize: "13px", color: "#d1d5db"
                          }}>
                          <span style={{
                            fontWeight: "700",
                            color: i === 0 ? "#facc15" : i === 1 ? "#cbd5e1" : i === 2 ? "#f97316" : "#9ca3af"
                          }}>
                            #{entry.rank || i + 1}
                          </span>
                          <span style={{ color: banned ? "#f87171" : "#f3f4f6", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {entry.name || `User ${i + 1}`}
                          </span>
                          <span style={{ textAlign: "center", color: "#10b981", fontWeight: "600" }}>
                            {entry.solved || 0}
                          </span>
                          <span style={{ textAlign: "center", color: "#a78bfa", fontWeight: "700" }}>
                            {entry.score || 0}
                          </span>
                          <span style={{ textAlign: "center", fontSize: "16px" }}>
                            {banned ? "🚩" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <div style={{ display: "flex", alignItems: "center", background: "#1e2433", borderBottom: "1px solid #2a2f3e", flexShrink: 0 }}>
            {["code", "result"].map(t => (
              <button key={t}
                onClick={() => setActiveRightTab(t)}
                style={{
                  padding: "10px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer",
                  background: "none", border: "none",
                  color: activeRightTab === t ? "#f3f4f6" : "#6b7280",
                  borderBottom: activeRightTab === t ? "2px solid #a78bfa" : "2px solid transparent"
                }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}

            {(!isActive) && (
              <span style={{
                marginLeft: "auto", marginRight: "16px", fontSize: "11px", fontWeight: "600",
                padding: "3px 10px", borderRadius: "20px",
                backgroundColor: isBanned ? "#ef444422" : contestStatus === "ended" ? "#ef444422" : "#3b82f622",
                color: isBanned ? "#ef4444" : contestStatus === "ended" ? "#ef4444" : "#60a5fa"
              }}>
                {isBanned ? "🚩 Banned" : contestStatus === "ended" ? "⛔ Contest Ended" : "⏳ Not Started"}
              </span>
            )}
          </div>

          {/* Editor */}
          {activeRightTab === "code" && (
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
              {isBanned && contestStatus === "live" && (
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(239,68,68,0.08)", zIndex: 10,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none"
                }}>
                  <span style={{ fontSize: "48px" }}>🚩</span>
                  <p style={{ color: "#f87171", fontWeight: "600", fontSize: "14px", marginTop: "8px" }}>
                    You are banned from this contest
                  </p>
                </div>
              )}
              {!selectedProblem ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280", fontSize: "14px", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "32px" }}>👈</span>
                  Select a problem from the left panel to start coding
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={LANGUAGE_MAP[language] || "cpp"}
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14, minimap: { enabled: false },
                    scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 },
                    readOnly: isBanned && contestStatus === "live",
                  }}
                />
              )}
            </div>
          )}

          {/* Result */}
          {activeRightTab === "result" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {(running || submitting) && (
                <div style={{ color: "#9ca3af", fontSize: "14px" }}>Running your code...</div>
              )}
              {result?.error && (
                <div style={{ backgroundColor: "#ef444422", border: "1px solid #ef444444", borderRadius: "8px", padding: "16px", color: "#f87171", fontSize: "14px" }}>
                  {result.error}
                </div>
              )}
              {result && !result.error && (
                <div>
                  {(result.verdict || result.status) && (
                    <div style={{ marginBottom: "20px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "700", color: statusColor(result.verdict || result.status) }}>
                        {(result.verdict || result.status) === "Accepted" ? "✓ Accepted" : `✗ ${result.verdict || result.status}`}
                      </span>
                      <span style={{ marginLeft: "12px", fontSize: "14px", color: "#9ca3af" }}>
                        {result.passedCount ?? result.passed ?? 0}/{result.total} testcases
                      </span>
                    </div>
                  )}
                  {result.results?.map((r, i) => (
                    <div key={i} style={{
                      marginBottom: "10px", backgroundColor: "#252b3b", borderRadius: "8px",
                      padding: "12px 16px", fontSize: "13px", color: "#d1d5db", lineHeight: "1.8",
                      borderLeft: `3px solid ${r.passed ? "#10b981" : "#ef4444"}`
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "600", color: r.passed ? "#10b981" : "#ef4444" }}>
                          {r.passed ? "✓" : "✗"} Testcase {i + 1}
                          {r.errorType && r.errorType !== "Accepted" && (
                            <span style={{ marginLeft: "8px", fontSize: "11px", color: "#f59e0b" }}>({r.errorType})</span>
                          )}
                        </span>
                      </div>
                      <div><span style={{ color: "#9ca3af" }}>Input: </span>{r.input}</div>
                      <div><span style={{ color: "#9ca3af" }}>Expected: </span>{r.expectedOutput}</div>
                      <div>
                        <span style={{ color: "#9ca3af" }}>Got: </span>
                        <span style={{ color: r.passed ? "#10b981" : "#f87171" }}>{r.actualOutput || "No output"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!result && !running && !submitting && (
                <div style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginTop: "60px" }}>
                  Run or Submit your code to see results here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestPage;