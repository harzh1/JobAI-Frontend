const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace exact hex
  content = content.replace(/#3846e6/gi, '#3442FF');
  // Sometimes it's written in lowercase
  content = content.replace(/#3846E6/gi, '#3442FF');
  
  // Replace prominent tailwind indigo classes
  content = content.replace(/text-indigo-[567]00/g, 'text-[#3442FF]');
  content = content.replace(/bg-indigo-[567]00/g, 'bg-[#3442FF]');
  content = content.replace(/border-indigo-[4567]00/g, 'border-[#3442FF]');
  content = content.replace(/ring-indigo-[4567]00/g, 'ring-[#3442FF]');
  
  // Replace in css
  if (filePath.endsWith('.css')) {
    content = content.replace(/#a8c7fa/g, '#3442FF'); // Gemini dark mode blue
  }

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
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

traverseDir('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src');
console.log('Done patching colors');
