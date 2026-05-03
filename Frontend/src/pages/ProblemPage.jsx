// Filename: Frontend/src/pages/ProblemPage.jsx
// this is ProblemPage.jsx
import { useState, useRef, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axiosClient from "../utils/axiosClient";

const LANGUAGES = ["C++", "JavaScript", "Python", "Java"];

const LANGUAGE_MAP = {
  "C++": { monacoLang: "cpp" },
  JavaScript: { monacoLang: "javascript" },
  Python: { monacoLang: "python" },
  Java: { monacoLang: "java" },
};

function ProblemPage() {
  const { pid } = useParams();
  const editorRef = useRef(null);

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [selectedLang, setSelectedLang] = useState("C++");
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissionsData, setSubmissionsData] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [expandedSub, setExpandedSub] = useState(null); // for showing code

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problems/problembyid/${pid}`);
        setProblem(data);
        const starter = data?.starterCode?.find((s) => s.language === "C++");
        setCode(starter?.intialCode || "// Write your solution here");
      } catch (err) {
        // suppress problem fetch errors from browser console
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [pid]);

  const fetchSubmissions = async () => {
    setSubLoading(true);
    try {
      const { data } = await axiosClient.get(`/problems/submittedproblems/${pid}`);
      setSubmissionsData(data);
    } catch (err) {
      // suppress submission fetch errors from browser console
      setSubmissionsData(null);
    } finally {
      setSubLoading(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setActiveRightTab("result");
    setResult(null);
    try {
      const { data } = await axiosClient.post(`/problems/run/${pid}`, { code, language: selectedLang });
      setResult(data);
    } catch (err) {
      setResult({
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Run failed",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setActiveRightTab("result");
    setResult(null);
    try {
      const { data } = await axiosClient.post(`/problems/submit/${pid}`, { code, language: selectedLang });
      setResult(data);
      fetchSubmissions();
    } catch (err) {
      setResult({
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Submit failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s) => {
    if (s === "Accepted") return "#10b981";
    if (s === "Wrong Answer") return "#ef4444";
    if (s === "Runtime Error") return "#f59e0b";
    if (s === "Time Limit Exceeded") return "#f59e0b";
    return "#9ca3af";
  };

  const difficultyColor = (d) => {
    if (d === "Easy") return "#10b981";
    if (d === "Medium") return "#f59e0b";
    if (d === "Hard") return "#ef4444";
    return "#9ca3af";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#9ca3af" }}>Loading...</div>
    </div>
  );

  if (!problem) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1f2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f87171" }}>Problem not found.</div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#1a1f2e", fontFamily: "sans-serif", overflow: "hidden" }}>

      {/* ── NAVBAR ── */}
      <div style={{ height: "50px", background: "#0b1220", borderBottom: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <NavLink to="/" style={{ color: "#a78bfa", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>
          CodeShinzo
        </NavLink>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value);
              const starter = problem?.starterCode?.find(s => s.language === e.target.value);
              setCode(starter?.intialCode || `// Write your ${e.target.value} solution here`);
            }}
            style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #334155", background: "#111827", color: "white", fontSize: "13px", cursor: "pointer", outline: "none" }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <button onClick={handleRun} disabled={running || submitting}
            style={{ padding: "7px 18px", borderRadius: "8px", border: "1px solid #3b82f6", background: "#2563eb", color: "white", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
            {running ? "Running..." : "Run"}
          </button>
          <button onClick={handleSubmit} disabled={running || submitting}
            style={{ padding: "7px 18px", borderRadius: "8px", border: "none", background: "#10b981", color: "white", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT ── */}
        <div style={{ width: "45%", display: "flex", flexDirection: "column", borderRight: "1px solid #2a2f3e", overflow: "hidden" }}>

          {/* Left Tabs */}
          <div style={{ display: "flex", background: "#1e2433", borderBottom: "1px solid #2a2f3e", flexShrink: 0 }}>
            {["description", "editorial", "solutions", "submissions"].map((tab) => (
              <button key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "submissions") fetchSubmissions();
                }}
                style={{ padding: "10px 14px", fontSize: "13px", fontWeight: "500", cursor: "pointer", background: "none", border: "none",
                  color: activeTab === tab ? "#f3f4f6" : "#6b7280",
                  borderBottom: activeTab === tab ? "2px solid #a78bfa" : "2px solid transparent" }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

            {/* Description */}
            {activeTab === "description" && (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#f3f4f6", marginBottom: "10px" }}>{problem.title}</h1>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ padding: "2px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: difficultyColor(problem.difficulty) + "22", color: difficultyColor(problem.difficulty), border: `1px solid ${difficultyColor(problem.difficulty)}44` }}>
                      {problem.difficulty}
                    </span>
                    {problem.tags && (
                      <span style={{ padding: "2px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", backgroundColor: "#0e749022", color: "#22d3ee", border: "1px solid #0e749044" }}>
                        {problem.tags}
                      </span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "#d1d5db", lineHeight: "1.7", marginBottom: "24px" }}>{problem.description}</p>
                {problem.visibletestcases?.map((tc, i) => (
                  <div key={i} style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#f3f4f6", marginBottom: "8px" }}>Example {i + 1}:</p>
                    <div style={{ backgroundColor: "#252b3b", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#d1d5db", lineHeight: "1.8" }}>
                      <div><span style={{ color: "#9ca3af" }}>Input: </span>{tc.input}</div>
                      <div><span style={{ color: "#9ca3af" }}>Output: </span>{tc.output}</div>
                      {tc.explanation && <div><span style={{ color: "#9ca3af" }}>Explanation: </span>{tc.explanation}</div>}
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "editorial" && (
              <div style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginTop: "60px" }}>Editorial not available yet.</div>
            )}

            {activeTab === "solutions" && (
              <div style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginTop: "60px" }}>No solutions yet.</div>
            )}

            {/* ── SUBMISSIONS TAB ── */}
            {activeTab === "submissions" && (
              <div>
                {subLoading ? (
                  <div style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center", marginTop: "40px" }}>Loading...</div>
                ) : !submissionsData || submissionsData.submissions?.length === 0 ? (
                  <div style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginTop: "60px" }}>No submissions yet.</div>
                ) : (
                  <>
                    {/* Stats Row */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                      <div style={{ backgroundColor: "#252b3b", borderRadius: "8px", padding: "12px 20px", textAlign: "center", flex: 1 }}>
                        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>Total</p>
                        <p style={{ fontSize: "20px", fontWeight: "700", color: "#f3f4f6" }}>{submissionsData.totalSubmissions}</p>
                      </div>
                      <div style={{ backgroundColor: "#252b3b", borderRadius: "8px", padding: "12px 20px", textAlign: "center", flex: 1 }}>
                        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>Accepted</p>
                        <p style={{ fontSize: "20px", fontWeight: "700", color: "#10b981" }}>{submissionsData.acceptedSubmissions}</p>
                      </div>
                      <div style={{ backgroundColor: "#252b3b", borderRadius: "8px", padding: "12px 20px", textAlign: "center", flex: 1 }}>
                        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>Rate</p>
                        <p style={{ fontSize: "20px", fontWeight: "700", color: "#a78bfa" }}>{submissionsData.acceptanceRate}%</p>
                      </div>
                    </div>

                    {/* Submission List */}
                    {submissionsData.submissions.map((sub, i) => (
                      <div key={sub._id || i} style={{ backgroundColor: "#1e2433", borderRadius: "10px", border: "1px solid #2a2f3e", marginBottom: "10px", overflow: "hidden" }}>

                        {/* Header Row */}
                        <div
                          onClick={() => setExpandedSub(expandedSub === i ? null : i)}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: statusColor(sub.status) }}>
                              {sub.status}
                            </span>
                            <span style={{ fontSize: "12px", color: "#6b7280", backgroundColor: "#252b3b", padding: "2px 10px", borderRadius: "20px" }}>
                              {sub.language}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>
                              {new Date(sub.createdAt).toLocaleString()}
                            </span>
                            <span style={{ color: "#6b7280", fontSize: "12px" }}>
                              {expandedSub === i ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Code View */}
                        {expandedSub === i && (
                          <div style={{ borderTop: "1px solid #2a2f3e" }}>

                            {/* Testcase stats */}
                            <div style={{ display: "flex", gap: "16px", padding: "10px 16px", backgroundColor: "#252b3b", fontSize: "12px", color: "#9ca3af" }}>
                              <span>Testcases: <span style={{ color: "#f3f4f6", fontWeight: "600" }}>{sub.testcasepassed ?? "?"}/{sub.totaltestcase ?? "?"}</span></span>
                              {sub.runtime > 0 && <span>Runtime: <span style={{ color: "#f3f4f6", fontWeight: "600" }}>{sub.runtime}s</span></span>}
                              {sub.memory > 0 && <span>Memory: <span style={{ color: "#f3f4f6", fontWeight: "600" }}>{sub.memory} KB</span></span>}
                            </div>

                            {/* Code */}
                            <div style={{ padding: "12px 16px" }}>
                              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Code</p>
                              <pre style={{ backgroundColor: "#0b1220", borderRadius: "8px", padding: "14px", fontSize: "12px", color: "#d1d5db", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
                                {sub.code}
                              </pre>
                            </div>

                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        

        {/* ── RIGHT ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Right Tabs */}
          <div style={{ display: "flex", background: "#1e2433", borderBottom: "1px solid #2a2f3e", flexShrink: 0 }}>
            {["code", "result"].map((t) => (
              <button key={t} onClick={() => setActiveRightTab(t)}
                style={{ padding: "10px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer", background: "none", border: "none",
                  color: activeRightTab === t ? "#f3f4f6" : "#6b7280",
                  borderBottom: activeRightTab === t ? "2px solid #a78bfa" : "2px solid transparent" }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Editor */}
          {activeRightTab === "code" && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <Editor
                height="100%"
                language={LANGUAGE_MAP[selectedLang]?.monacoLang || "cpp"}
                value={code}
                onMount={(e) => (editorRef.current = e)}
                onChange={(v) => setCode(v || "")}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, padding: { top: 12 } }}
              />
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
                  {/* Verdict */}
                  {result.verdict && (
                    <div style={{ marginBottom: "20px" }}>
                      <span style={{ fontSize: "20px", fontWeight: "700", color: statusColor(result.verdict) }}>
                        {result.verdict === "Accepted" ? "✓ Accepted" : `✗ ${result.verdict}`}
                      </span>
                      <span style={{ marginLeft: "12px", fontSize: "14px", color: "#9ca3af" }}>
                        {result.passedCount}/{result.total} testcases
                      </span>
                    </div>
                  )}

                  {/* Per testcase */}
                  {result.results?.map((r, i) => (
                    <div key={i} style={{ marginBottom: "10px", backgroundColor: "#252b3b", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#d1d5db", lineHeight: "1.8", borderLeft: `3px solid ${r.passed ? "#10b981" : "#ef4444"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "600", color: r.passed ? "#10b981" : "#ef4444" }}>
                          {r.passed ? "✓" : "✗"} Testcase {i + 1}
                        </span>
                      </div>
                      <div><span style={{ color: "#9ca3af" }}>Input: </span>{r.input}</div>
                      <div><span style={{ color: "#9ca3af" }}>Expected: </span>{r.expectedOutput}</div>
                      <div>
  <span style={{ color: "#9ca3af" }}>Got: </span>
  <span style={{ color: r.passed ? "#10b981" : "#f87171", whiteSpace: "pre-wrap", display: "inline-block", maxWidth: "100%" }}>
    {r.actualOutput || "No output"}
  </span>
</div>
                    </div>
                  ))}
                </div>
              )}

              {!result && !running && !submitting && (
                <div style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginTop: "60px" }}>
                  Run or Submit your code to see results.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;