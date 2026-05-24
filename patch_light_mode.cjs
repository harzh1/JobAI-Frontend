const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace exact hex
  content = content.replace(/#3846e6/gi, '#3442FF');
  
  // Replace prominent tailwind indigo classes
  content = content.replace(/text-indigo-[567]00/g, 'text-[#3442FF]');
  content = content.replace(/bg-indigo-[567]00/g, 'bg-[#3442FF]');
  content = content.replace(/border-indigo-[4567]00/g, 'border-[#3442FF]');
  content = content.replace(/ring-indigo-[4567]00/g, 'ring-[#3442FF]');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated: ' + filePath);
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

// 1. Process all JSX files
traverseDir('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src');

// 2. Process index.css with precise logic
let cssPath = 'c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Ensure root primary blue is updated
css = css.replace(/--primary-blue: #0b57d0;/g, '--primary-blue: #3442FF;');
css = css.replace(/--primary-blue: #3846e6;/g, '--primary-blue: #3442FF;');

// Ensure buttons have white text in light mode
css = css.replace(
`button.primary {
  background-color: var(--primary-blue) !important;
  color: var(--surface-bg) !important;`,
`button.primary {
  background-color: var(--primary-blue) !important;
  color: #ffffff !important;`
);

// Ensure buttons have dark text in dark mode
css = css.replace(
`.theme-dark button.primary {
  color: #131314 !important;
}`,
`.theme-dark button.primary {
  color: #062e6f !important;
}`
);

// Add the new dark mode overrides for #3442FF classes
const overrides = `
.theme-dark .text-\\[\\#3442FF\\] {
  color: var(--primary-blue) !important;
}
.theme-dark .bg-\\[\\#3442FF\\] {
  background-color: var(--primary-blue) !important;
  color: #062e6f !important;
}
.theme-dark .border-\\[\\#3442FF\\] {
  border-color: var(--primary-blue) !important;
}
.theme-dark .border-\\[\\#3442FF\\]\\/40 {
  border-color: rgba(168, 199, 250, 0.4) !important;
}
.theme-dark .border-\\[\\#3442FF\\]\\/50 {
  border-color: rgba(168, 199, 250, 0.5) !important;
}
.theme-dark .ring-\\[\\#3442FF\\]\\/20 {
  --tw-ring-color: rgba(168, 199, 250, 0.2) !important;
}
`;

// Replace the old #3846e6 dark overrides with the new #3442FF ones
css = css.replace(
`.theme-dark .text-\\[\\#3846e6\\] {
  color: var(--primary-blue) !important;
}
.theme-dark .bg-\\[\\#3846e6\\] {
  background-color: var(--primary-blue) !important;
  color: #062e6f !important;
}`,
overrides.trim()
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Done patching light mode');
