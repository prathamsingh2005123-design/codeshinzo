// Filename: src/routes/submit.js
const express = require("express");
const router = express.Router();

const userMiddleware = require("../middleware/userMiddleware");

const { runCode, submitSolution } = require("../controllers/usersubmission");

router.post("/run/:id", userMiddleware, runCode);
router.post("/submit/:id", userMiddleware, submitSolution);

module.exports = router;