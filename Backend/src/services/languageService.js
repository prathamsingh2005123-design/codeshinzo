// Filename: src/services/languageService.js
const axios = require("axios");

/* =========================
   LANGUAGE MAP (FIXED + SAFE)
========================= */
const LANGUAGE_MAP = {
  javascript: 63,
  js: 63,

  python: 71,

  java: 62,

  "c++": 54,
  cpp: 54, // 🔥 FIX: IMPORTANT
};

/* =========================
   JUDGE0 CONFIG (UPDATED)
========================= */
const JUDGE0_URL = "https://ce.judge0.com";

/* =========================
   LANGUAGE RESOLVER (FIXED)
========================= */
const getLanguageId = async (language) => {
  if (!language) {
    throw new Error("Language is required");
  }

  const normalized = language.toLowerCase();

  console.log("LANGUAGE REQUESTED:", normalized);

  const langId = LANGUAGE_MAP[normalized];

  if (!langId) {
    throw new Error("Unsupported language: " + language);
  }

  return langId;
};

/* =========================
   UTIL
========================= */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* =========================
   SUBMIT BATCH (UPDATED - PUBLIC API)
========================= */
const submitBatch = async (submissions) => {
  try {
    console.log("🔥 Sending to Judge0 (Public API)...");

    const results = [];

    for (let i = 0; i < submissions.length; i++) {
      const s = submissions[i];

      try {
        const response = await axios.post(
          `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
          {
            source_code: s.source_code,
            language_id: s.language_id,
            stdin: s.stdin || "",
          }
        );

        const r = response.data;

        results.push({
          token: r.token || null,
          stdout: r.stdout || "",
          stderr: r.stderr || "",
          compile_output: r.compile_output || "",
          status: r.status,
        });

      } catch (innerErr) {
        console.log("⚠️ Single submission failed:", innerErr.response?.status, innerErr.response?.data || innerErr.message);

        const responseData = innerErr.response?.data;
        const responseMessage = responseData
          ? typeof responseData === "string"
            ? responseData
            : JSON.stringify(responseData)
          : innerErr.message;

        results.push({
          token: null,
          stdout: "",
          stderr: "",
          compile_output: `Judge0 request failed: ${innerErr.response?.status || "unknown"} - ${responseMessage}`,
          status: { id: 6, description: "Error" },
        });
      }
    }

    if (!results || results.length === 0) {
      throw new Error("Judge0 returned empty response");
    }

    console.log("✅ Judge0 execution completed");

    return results;

  } catch (err) {
    console.log("❌ JUDGE0 ERROR:", err.message);
    throw err;
  }
};

module.exports = {
  getLanguageId,
  submitBatch,
};