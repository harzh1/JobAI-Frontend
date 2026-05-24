const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Revert the logo blue back to original blue
  content = content.replace(/#3442FF/gi, '#3846e6');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reverted: ' + filePath);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

traverseDir('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src');

// Explicitly fix index.css
let cssPath = 'c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/--primary-blue: #3442FF;/g, '--primary-blue: #a8c7fa;');

css = css.replace(
`button.primary {
  background-color: var(--primary-blue) !important;
  color: #ffffff !important;`,
`button.primary {
  background-color: var(--primary-blue) !important;
  color: var(--surface-bg) !important;`
);

css = css.replace(
`.theme-dark button.primary {
  color: #ffffff !important;
}`,
`.theme-dark button.primary {
  color: #131314 !important;
}`
);

css = css.replace(
`.theme-dark .text-\\[\\#3442FF\\] {
  color: var(--primary-blue) !important;
}`,
`.theme-dark .text-\\[\\#3846e6\\] {
  color: var(--primary-blue) !important;
}`
);

css = css.replace(
`.theme-dark .bg-\\[\\#3442FF\\] {
  background-color: var(--primary-blue) !important;
  color: #ffffff !important;
}`,
`.theme-dark .bg-\\[\\#3846e6\\] {
  background-color: var(--primary-blue) !important;
  color: #062e6f !important;
}`
);

css = css.replace(
`.theme-dark .theme-dark\\:bg-\\[#3442FF\\] {`,
`.theme-dark .theme-dark\\:bg-indigo-500 {`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log("Done reverting index.css");
