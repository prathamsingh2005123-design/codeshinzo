import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authslice";
import { checkAuth } from "../authslice";

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
 const user = useSelector((state) => state.auth?.user);
  console.log("USER =", user);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [showLogout, setShowLogout] = useState(false);

  const dropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  /* ---------------- UI SETUP ---------------- */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.style.backgroundColor = "#1a1f2e";
    document.body.style.margin = "0";
  }, []);

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problems/getallproblems");
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get(
          "/problems/problemsolvedbyuser/solved"
        );
        setSolvedProblems(data);
      } catch (err) {
        console.error("Error fetching solved problems:", err);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  /* ---------------- DROPDOWN CLOSE ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowLogout(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    setShowLogout(false);
  };

  const solvedSet = new Set(
    solvedProblems.map((sp) =>
      typeof sp === "string" ? sp : sp._id?.toString()
    )
  );

  const allTags = [
    "Array", "String", "Linked List", "Tree", "Graph",
    "Dynamic Programming", "Backtracking", "Greedy",
    "Sorting", "Searching",
  ];

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" ||
      problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();

    const tagMatch =
      filters.tag === "all" ||
      (Array.isArray(problem.tags) &&
        problem.tags.includes(filters.tag));

    const isSolved = solvedSet.has(problem._id?.toString());

    const statusMatch =
      filters.status === "all" ||
      (filters.status === "solved" && isSolved) ||
      (filters.status === "unsolved" && !isSolved);

    return difficultyMatch && tagMatch && statusMatch;
  });

  const difficultyColor = (d) => {
    const lower = d?.toLowerCase();
    if (lower === "easy") return { backgroundColor: "#10b981", color: "#fff" };
    if (lower === "medium") return { backgroundColor: "#f59e0b", color: "#fff" };
    if (lower === "hard") return { backgroundColor: "#ef4444", color: "#fff" };
    return { backgroundColor: "#374151", color: "#fff" };
  };

  const container = {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "0 24px",
  };

  const selectStyle = {
    backgroundColor: "#252b3b",
    color: "#d1d5db",
    border: "1px solid #3a4050",
    padding: "10px 14px",
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer",
    minWidth: "150px"
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#1a1f2e" }}>

      {/* NAVBAR */}
      <div style={{ borderBottom: "1px solid #2a2f3e" }}>
        <div style={{
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <span style={{ color: "#fff", fontWeight: "700" }}>
              CodeShinzo
            </span>

            <NavLink to="/" style={{ color: "#9ca3af" }}>
              Problems
            </NavLink>

            <NavLink to="/contests" style={{ color: "#9ca3af" }}>
              Contests
            </NavLink>

            <NavLink to="/leaderboard" style={{ color: "#9ca3af" }}>
              Leaderboard
            </NavLink>

            <NavLink to="/profile" style={{ color: "#9ca3af" }}>
              Profile
            </NavLink>
          </div>

          <div ref={dropdownRef}>
            <button
              onClick={() => setShowLogout((p) => !p)}
              style={{ background: "none", border: "none", color: "#fff" }}
            >
              {user?.name || "Profile"}
            </button>

            {showLogout && (
              <div style={{
                position: "absolute",
                background: "#252b3b",
                border: "1px solid #3a4050",
                borderRadius: "8px",
                marginTop: "5px"
              }}>
                <button
                  onClick={handleLogout}
                  style={{ color: "#f87171", padding: "10px" }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ ...container, paddingTop: "20px" }}>
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}>

          <button
            onClick={() => navigate("/contests")}
            style={{
              padding: "10px 14px",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            🎯 Join Contests
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            style={{
              padding: "10px 14px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            🏆 Leaderboard
          </button>

          {/* 👑 ADMIN ONLY BUTTON */}
         {user && user.role && user.role.toLowerCase() === "admin" &&  (
            <button
              onClick={() => navigate("/admin/contest")}
              style={{
                padding: "10px 14px",
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              ➕ Create Contest
            </button>
          )}

        </div>
      </div>

      {/* BODY */}
      <div style={{ ...container, paddingTop: "10px" }}>

        {/* FILTERS */}
        <div style={{
          display: "flex",
          gap: "16px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}>
          <select
            style={selectStyle}
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="all">All</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>

          <select
            style={selectStyle}
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
          >
            <option value="all">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            style={selectStyle}
            value={filters.tag}
            onChange={(e) =>
              setFilters({ ...filters, tag: e.target.value })
            }
          >
            <option value="all">All Tags</option>
            {allTags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* PROBLEMS */}
        {filteredProblems.length === 0 ? (
          <div style={{ color: "#6b7280", padding: "40px" }}>
            No problems found.
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <NavLink
              key={problem._id}
              to={`/problems/${problem._id}`}
              style={{
                display: "block",
                padding: "16px",
                background: "#1e2433",
                marginBottom: "10px",
                borderRadius: "10px",
                textDecoration: "none"
              }}
            >
              <div style={{ color: "#fff", marginBottom: "8px" }}>
                {problem.title}
              </div>
            </NavLink>
          ))
        )}
      </div>
    </div>
  );
}

export default Homepage;