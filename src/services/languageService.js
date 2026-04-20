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
   JUDGE0 CONFIG
========================= */
const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

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
   SUBMIT BATCH (JUDGE0)
========================= */
const submitBatch = async (submissions) => {
  try {
    console.log("🔥 Sending to Judge0...");

    // encode base64
    const encodedSubmissions = submissions.map((s) => ({
      source_code: Buffer.from(s.source_code || "").toString("base64"),
      language_id: s.language_id,
      stdin: Buffer.from(s.stdin || "").toString("base64"),
    }));

    console.log("📦 Encoded submissions ready:", encodedSubmissions.length);

    const response = await axios.post(
      `${JUDGE0_URL}/submissions/batch?base64_encoded=true`,
      { submissions: encodedSubmissions }
    );

    const tokens = response.data.map((t) => t.token);
    const tokenString = tokens.join(",");

    let results = [];
    let attempts = 0;

    const MAX_ATTEMPTS = 25;
    const TIMEOUT_MS = 25000;
    const start = Date.now();

    while (attempts < MAX_ATTEMPTS) {
      if (Date.now() - start > TIMEOUT_MS) {
        throw new Error("Judge0 timeout: execution too slow");
      }

      await sleep(1000);

      const res = await axios.get(
        `${JUDGE0_URL}/submissions/batch?tokens=${tokenString}&base64_encoded=true`
      );

      results = res.data.submissions.map((r, i) => ({
        token: tokens[i],

        stdout: r.stdout
          ? Buffer.from(r.stdout, "base64").toString()
          : "",

        stderr: r.stderr
          ? Buffer.from(r.stderr, "base64").toString()
          : "",

        compile_output: r.compile_output
          ? Buffer.from(r.compile_output, "base64").toString()
          : "",

        status: r.status,
      }));

      const allDone = results.every((r) => r.status?.id >= 3);

      if (allDone) break;

      attempts++;
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