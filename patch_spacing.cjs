const fs = require('fs');

function patchFile(filepath) {
  if (!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');

  // Reduce logo size and bottom margin
  content = content.replace(
    /className="w-40 flex items-center justify-center text-\[var\(--text-primary\)\] mb-8"/g,
    'className="w-32 flex items-center justify-center text-[var(--text-primary)] mb-2"'
  );
  
  // Reduce spacing above the header text
  content = content.replace(
    /className="mb-8 text-center mt-2"/g,
    'className="mb-6 text-center"'
  );
  
  // Also fix ForgotPassword.jsx which has different header classes
  content = content.replace(
    /className="flex flex-col items-center gap-2 mb-8"/g,
    'className="flex flex-col items-center gap-2 mb-2"'
  );
  content = content.replace(
    /className="w-40 flex items-center justify-center text-\[var\(--text-primary\)\]"/g,
    'className="w-32 flex items-center justify-center text-[var(--text-primary)]"'
  );
  content = content.replace(
    /className="text-center mb-8"/g,
    'className="text-center mb-6"'
  );
  content = content.replace(
    /className="text-2xl font-bold font-heading text-gray-900 mb-2 mt-2"/g,
    'className="text-2xl font-bold font-heading text-gray-900 mb-2"'
  );
  
  // Fix button margin in login and signup
  content = content.replace(
    /className="primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"/g,
    'className="primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"'
  );

  fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/Login.jsx');
patchFile('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/Signup.jsx');
patchFile('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/ForgotPassword.jsx');

console.log('Done patching spacing issues');
