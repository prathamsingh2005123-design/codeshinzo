// Filename: src/controllers/userProblem.js
// Fixed userProblem.js controller

const { getLanguageId, submitBatch } = require("../services/languageService");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submissions");
const getStatus = (result) => {
  const id = result?.status?.id;

  if (id === 3) return "Accepted";
  if (id === 4) return "Wrong Answer";
  if (id === 5) return "Time Limit Exceeded";
  if (id === 6) return "Compilation Error";
  if (id >= 7) return "Runtime Error";

  return "Pending";
};


const createProblem = async (req, res) => {

  const {
    title,
    description,
    difficulty,
    tags,
    visibletestcases,
    hiddentestcases,
    referenceSolution,
  } = req.body;

  try {

    const filteredReference = referenceSolution.filter(
      (sol) => sol.completeCode && sol.completeCode.trim() !== ""
    );

    if (filteredReference.length === 0) {
      return res.status(400).json({
        message: "At least one reference solution is required"
      });
    }

    const tagsArray = Array.isArray(tags)
      ? tags.filter((tag) => tag && tag.toString().trim() !== "")
      : [tags].filter((tag) => tag && tag.toString().trim() !== "");

    const allTestcases = [...visibletestcases, ...hiddentestcases];


    for (const { language, completeCode } of filteredReference) {

      const languageId = await getLanguageId(language);

      const submissions = allTestcases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input
      }));


      const submitResults = await submitBatch(submissions);


      for (let i = 0; i < submitResults.length; i++) {

      const normalize = (str) =>
  (str || "").toString().trim().replace(/\r/g, "");

const stdout = normalize(submitResults[i]?.stdout);
const expected = normalize(allTestcases[i].output);
       
        const status = submitResults[i]?.status?.description || "";

        if (status !== "Accepted" || stdout !== expected) {

          return res.status(400).json({
            message: `Reference solution failed on testcase ${i + 1}`,
            testcase: allTestcases[i],
            result: submitResults[i]
          });

        }
      }
    }

const problemCreatorId = req.user?._id;

    if (!problemCreatorId) {
      return res.status(401).json({
        message: "Unauthorized: user not found in request"
      });
    }


    const userProblem = await Problem.create({
      title,
      description,
      difficulty,
      tags: tagsArray,
      visibletestcases,
      hiddentestcases,
      referenceSolution: filteredReference,
      problemCreator: problemCreatorId
    });


    res.status(201).json({
      message: "Problem created successfully",
      problem: userProblem
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error during problem validation",
      error: error.message
    });

  }
};





const updateProblem = async (req, res) => {

  const { id } = req.params;

  const {
    title,
    description,
    difficulty,
    tags,
    visibletestcases,
    hiddentestcases,
    referenceSolution,
  } = req.body;

  try {

    if (!id) {
      return res.status(400).json({ message: "Problem ID is required" });
    }

    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const filteredReference = referenceSolution.filter(
      (sol) => sol.completeCode && sol.completeCode.trim() !== ""
    );

    const allTestcases = [...visibletestcases, ...hiddentestcases];

    for (const { language, completeCode } of filteredReference) {

      const languageId = await getLanguageId(language);

      const submissions = allTestcases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input
      }));

      const submitResults = await submitBatch(submissions);

      for (let i = 0; i < submitResults.length; i++) {

        const stdout = submitResults[i]?.stdout?.trim() || "";
        const expected = allTestcases[i].output.trim();
        const status = submitResults[i]?.status?.description || "";

        if (status !== "Accepted" || stdout !== expected) {

          return res.status(400).json({
            message: `Reference solution failed on testcase ${i + 1}`,
            testcase: allTestcases[i],
            result: submitResults[i]
          });

        }
      }
    }


    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      {
        title,
        description,
        difficulty,
        tags,
        visibletestcases,
        hiddentestcases,
        referenceSolution: filteredReference
      },
      { runValidators: true, new: true }
    );


    res.status(200).json(updatedProblem);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};





const deleteProblem = async (req, res) => {

  const { id } = req.params;

  try {

    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json({ message: "Problem deleted" });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};





const getProblemById = async (req, res) => {

  try {

    const problem = await Problem.findById(req.params.id)
      .select("_id title description difficulty tags visibletestcases problemCreator starterCode")

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};





const getAllProblems = async (req, res) => {

  try {

    const problems = await Problem.find({})
      .select("_id title description difficulty tags");

    if (problems.length === 0) {
      return res.status(404).json({ message: "No problems found" });
    }

    res.status(200).send(problems);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};





const solvedProblemsbyUser = async (req, res) => {

  try {

   const userId = req.user?._id;

    const user = await User.findById(userId)
      .populate({
        path: "problemsSolved",
        select: "_id title description difficulty tags"
      });

    res.status(200).send(user.problemsSolved);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};





/* =========================
   FIXED SUBMISSIONS API
   ========================= */

const submittedProblemsbyUser = async (req, res) => {
  try {

    const userId = req.user._id;
    const problemId = req.params.pid;

    const submissions = await Submission.find({
  userId: userId,
  problemId: problemId
}).sort({ createdAt: -1 });

    const totalSubmissions = submissions.length;

    const acceptedSubmissions = submissions.filter(
      sub => sub.status === "Accepted"
    ).length;

    const acceptanceRate =
      totalSubmissions === 0
        ? 0
        : ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2);

    res.status(200).json({
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      submissions
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};




module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblems,
  solvedProblemsbyUser,
  submittedProblemsbyUser
};