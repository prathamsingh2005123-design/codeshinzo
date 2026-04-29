// Filename: src/controllers/usersubmission.js
const Problem = require("../models/problem");
const { submitBatch, getLanguageId } = require("../services/languageService");
const Submission = require("../models/submissions");
const User = require("../models/user");
const ContestBan = require("../models/contestBan");

const cleanError = (err) => {
  if (!err) return "";
  const lines = err.split("\n");
  let lineNumber = "";
  let codeLine = "";
  let message = "";
  for (let line of lines) {
    if (line.includes("main.cpp:") && line.includes("error:")) {
      const match = line.match(/main\.cpp:(\d+):/);
      if (match) lineNumber = match[1];
      message = line.split("error:")[1]?.trim() || "";
    }
    const codeMatch = line.match(/^\s*\d+\s*\|\s*(.*)/);
    if (codeMatch && !codeLine) {
      const candidate = codeMatch[1].trim();
      if (!candidate.includes("operator>") && !candidate.includes("std::") && !candidate.includes("noexcept")) {
        codeLine = candidate;
      }
    }
  }
  let finalMsg = "Compilation Error:\n";
  if (lineNumber) finalMsg += `Line ${lineNumber}: `;
  if (codeLine) finalMsg += `${codeLine}\n`;
  if (message) finalMsg += `${message}\n`;
  if (codeLine.includes("cin >")) finalMsg += "Hint: Did you mean 'cin >> n' ?";
  if (codeLine.includes("cout <")) finalMsg += "Hint: Did you mean 'cout <<' ?";
  return finalMsg;
};

const normalize = (str) => (str || "").toString().replace(/\r/g, "").trim();

/* =========================
   RUN CODE
========================= */
const runCode = async (req, res) => {
  try {
    const problemId = req.params.id;
    const { code, language } = req.body;

    const problem = await Problem.findById(problemId)
      .select("_id visibletestcases hiddentestcases driverCode starterCode");

    if (!problem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    const languageId = await getLanguageId(language);

    // ── Append driver code ──
    const driverCode = problem.driverCode?.find(d => d.language === language)?.code || "";
    const finalCode = driverCode ? code + "\n\n" + driverCode : code;

    const testcases = problem.visibletestcases || [];

    const submissions = testcases.map((tc) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: tc.input,
    }));

    const results = await submitBatch(submissions);

    const formatted = results.map((r, i) => {
      let output = "";
      let errorType = "";

      if (r.compile_output) {
        output = cleanError(r.compile_output);
        errorType = "Compilation Error";
      } else if (r.stderr) {
        output = r.stderr;
        errorType = "Runtime Error";
      } else if (r.status.id === 3) {
        output = r.stdout;
        errorType = "Accepted";
      }

      const actual = normalize(output);
      const expected = normalize(testcases[i]?.output);

      return {
        input: testcases[i]?.input || "",
        expectedOutput: testcases[i]?.output || "",
        actualOutput: actual,
        errorType,
        passed: actual === expected && errorType === "Accepted",
      };
    });

    return res.json({
      success: true,
      results: formatted,
      verdict: formatted.every((r) => r.passed) ? "Accepted" : "Wrong Answer",
      passedCount: formatted.filter(r => r.passed).length,
      total: formatted.length,
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =========================
   SUBMIT CODE
========================= */
const Leaderboard = require("../models/leaderboard");

const submitSolution = async (req, res) => {
  // Ban check karo


// submitSolution function ke andar, problemId ke baad

  try {
    console.log("🔥 submitSolution HIT");

    const userId = req.user._id;
    const problemId = req.params.id;
    const { code, language, contestId } = req.body;
    // ── Ban Check ──
if (contestId) {
  const ban = await ContestBan.findOne({ userId, contestId });
  if (ban) {
    return res.status(403).json({
      success: false,
      message: "You are banned from this contest due to tab switching",
      isBanned: true,
    });
  }
}

    const problem = await Problem.findById(problemId)
      .select("_id visibletestcases hiddentestcases driverCode starterCode difficulty");

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const languageId = await getLanguageId(language);

    // ── Append driver code ──
    const driverCode = problem.driverCode?.find(d => d.language === language)?.code || "";
    const finalCode = driverCode ? code + "\n\n" + driverCode : code;

    const allTestcases = [
      ...(problem.visibletestcases || []),
      ...(problem.hiddentestcases || []),
    ];

    const submissions = allTestcases.map((tc) => ({
      source_code: finalCode,
      language_id: languageId,
      stdin: tc.input,
    }));

    const results = await submitBatch(submissions);

    let passed = 0;
    const detailedResults = [];

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      let output = "";

      if (r.status.id === 3) {
        output = r.stdout;
      } else if (r.compile_output) {
        output = cleanError(r.compile_output);
      } else if (r.stderr) {
        output = r.stderr;
      }

      const actual = normalize(output);
      const expected = normalize(allTestcases[i].output);
      const isPassed = actual === expected && r.status.id === 3;

      if (isPassed) passed++;

      let errorType = "";
      if (r.status.id === 3) errorType = "Accepted";
      else if (r.compile_output) errorType = "Compilation Error";
      else if (r.stderr) errorType = "Runtime Error";
      else errorType = "Error";

      detailedResults.push({
        input: allTestcases[i].input,
        expectedOutput: allTestcases[i].output,
        actualOutput: actual,
        errorType,
        passed: isPassed,
      });
    }

    const total = allTestcases.length;
    const finalStatus = passed === total ? "Accepted" : "Wrong Answer";

    const submission = await Submission.create({
      userId,
      problemId,
      contestId: contestId || null,
      language,
      code,
      status: finalStatus,
      testcasesPassed: passed,
      totalTestcases: total,
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { "stats.totalSubmissions": 1 },
    });

    if (finalStatus === "Accepted") {
      const user = await User.findById(userId);

      const alreadySolvedUser = user.problemsSolved.some(
        (pid) => pid.toString() === problemId.toString()
      );

      await User.findByIdAndUpdate(userId, {
        $inc: { "stats.acceptedSubmissions": 1 },
      });

      if (!alreadySolvedUser) {
        await User.findByIdAndUpdate(userId, {
          $addToSet: { problemsSolved: problemId },
          $inc: { "stats.totalSolved": 1 },
        });
      }

      // 🔥🔥🔥 LEADERBOARD FIX START 🔥🔥🔥
      if (contestId) {
        const scoreMap = {
          easy: 100,
          medium: 200,
          hard: 300,
        };

        const score =
          scoreMap[problem.difficulty?.toLowerCase()] || 0;

        let entry = await Leaderboard.findOne({
          contestId,
          userId,
        });

        if (!entry) {
          entry = await Leaderboard.create({
            contestId,
            userId,
            score: 0,
            solvedCount: 0,
            solvedProblems: [],
          });
        }

        const alreadySolved = entry.solvedProblems.some(
          (p) => p.toString() === problemId.toString()
        );

        console.log("Already Solved (LB):", alreadySolved);

        if (!alreadySolved) {
          entry.solvedProblems.push(problemId);
          entry.score += score;
          entry.solvedCount += 1;
        }

        await entry.save();
      }
      // 🔥🔥🔥 LEADERBOARD FIX END 🔥🔥🔥
    }

    return res.status(200).json({
      status: finalStatus,
      verdict: finalStatus,
      passed,
      passedCount: passed,
      total,
      submission,
      results: detailedResults,
    });

  } catch (error) {
    console.log("SUBMIT ERROR:", error);
    return res.status(500).json({ message: "Submission failed", error: error.message });
  }
};

module.exports = { runCode, submitSolution };