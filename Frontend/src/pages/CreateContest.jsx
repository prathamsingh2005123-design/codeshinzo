// Filename: Frontend/src/pages/CreateContest.jsx
import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

const CreateContest = () => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);

  // FETCH PROBLEMS
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axiosClient.get("/problems/getallproblems");
        setProblems(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProblems();
  }, []);

  // DEBUG: selected problems
  useEffect(() => {
    console.log("SELECTED PROBLEMS:", selectedProblems);
  }, [selectedProblems]);

  // TOGGLE PROBLEM SELECTION
  const toggleProblem = (id) => {
    setSelectedProblems((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  // CREATE CONTEST
  const handleCreate = async () => {
    try {
      console.log("FINAL PAYLOAD:", {
        title,
        startTime,
        duration,
        problems: selectedProblems,
      });

      await axiosClient.post("/contests/create", {
  title,
  startTime,
  duration,
  problems: selectedProblems,
});

      alert("Contest Created 🚀");
    } catch (err) {
      console.log(err);
    }
  };

  const isFormValid =
    title &&
    startTime &&
    duration &&
    selectedProblems.length > 0;

  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <h1>Create Contest</h1>

      {/* TITLE */}
      <input
        placeholder="Contest Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <br /><br />

      {/* START TIME */}
      <input
        type="datetime-local"
        onChange={(e) => setStartTime(e.target.value)}
      />
      <br /><br />

      {/* DURATION */}
      <input
        placeholder="Duration (minutes)"
        type="number"
        onChange={(e) => setDuration(e.target.value)}
      />
      <br /><br />

      {/* PROBLEM LIST */}
      <h3>Select Problems</h3>

      {problems.map((p) => (
        <div
          key={p._id}
          onClick={() => toggleProblem(p._id)}
          style={{
            padding: "10px",
            margin: "5px",
            cursor: "pointer",
            background: selectedProblems.includes(p._id)
              ? "#22c55e"
              : "#222",
            border: selectedProblems.includes(p._id)
              ? "2px solid #16a34a"
              : "1px solid #444",
            color: "#fff",
            borderRadius: "6px",
          }}
        >
          {p.title}
        </div>
      ))}

      <br />

      {/* CREATE BUTTON */}
      <button
        onClick={handleCreate}
        disabled={!isFormValid}
        style={{
          padding: "10px 15px",
          background: isFormValid ? "green" : "gray",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: isFormValid ? "pointer" : "not-allowed",
        }}
      >
        Create Contest 🚀
      </button>
    </div>
  );
};

export default CreateContest;