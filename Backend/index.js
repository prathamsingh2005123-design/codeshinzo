// Filename: index.js
// Root entrypoint fallback so "nodemon index.js" works from project root.
// It re-uses the existing src/index.js Express app startup.
require('dotenv').config();
require('./src/index');
