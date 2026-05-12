// Filename: src/routes/problemCreator.js
// this is problemCreator.js - the router for handling all problem-related routes, including admin routes for creating, updating and deleting problems, and user routes for retrieving problems and user-specific problem data

const express = require("express");
const router = express.Router();

const adminmiddleware = require("../middleware/adminmiddleware");
const userMiddleware = require("../middleware/userMiddleware");

const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getProblemForEdit,
  getAllProblems,
  solvedProblemsbyUser,
  submittedProblemsbyUser,
} = require("../controllers/userProblem");

const {
  runCode,
  submitSolution
} = require("../controllers/usersubmission");

/* ADMIN */
router.post("/create", adminmiddleware, createProblem);
router.put("/update/:id", adminmiddleware, updateProblem);
router.delete("/delete/:id", adminmiddleware, deleteProblem);
router.get("/edit/:id", adminmiddleware, getProblemForEdit);

/* PROBLEMS */
router.get("/getallproblems", getAllProblems);
router.get("/problembyid/:id", getProblemById);

/* USER */
router.get("/problemsolvedbyuser/solved", userMiddleware, solvedProblemsbyUser);
router.get("/submittedproblems/:pid", userMiddleware, submittedProblemsbyUser);

/* CODE */
router.post("/run/:id", userMiddleware, runCode);
router.post("/submit/:id", userMiddleware, submitSolution);

module.exports = router;