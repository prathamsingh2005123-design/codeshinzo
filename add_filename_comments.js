// Filename: add_filename_comments.js
const fs = require('fs').promises;
const path = require('path');

async function addFilenameComment(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  let updatedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    const relPath = path.relative('.', fullPath).replace(/\\/g, '/');

    if (file.isDirectory()) {
      updatedCount += await addFilenameComment(fullPath);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      if (['.js', '.jsx', '.css'].includes(ext)) {
        try {
          let content = await fs.readFile(fullPath, 'utf8');
          
          // Check if already has filename comment
          const jsCommentCheck = content.trim().startsWith('// Filename:');
          const cssCommentCheck = ext === '.css' && content.trim().startsWith('/* Filename:');
          
          if (!jsCommentCheck && !cssCommentCheck) {
            let comment;
            if (ext === '.css') {
              comment = `/* Filename: ${relPath} */\n`;
            } else {
              comment = `// Filename: ${relPath}\n`;
            }
            const newContent = comment + content;
            await fs.writeFile(fullPath, newContent, 'utf8');
            console.log(`Updated: ${relPath}`);
            updatedCount++;
          } else {
            console.log(`Skipped (already has): ${relPath}`);
          }
        } catch (err) {
          console.error(`Error processing ${relPath}:`, err.message);
        }
      }
    }
  }
  return updatedCount;
}

(async () => {
  try {
    const totalUpdated = await addFilenameComment('.');
    console.log(`\\nTotal files updated: ${totalUpdated}`);
  } catch (err) {
    console.error('Script error:', err);
  }
})();

