const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Fix logo overlap by adding mb-8 to the logo container
  content = content.replace(
    /className="w-40 flex items-center justify-center text-\[var\(--text-primary\)\]"/g,
    'className="w-40 flex items-center justify-center text-[var(--text-primary)] mb-8"'
  );

  // Fix card border by adding !border-transparent
  content = content.replace(
    /card relative z-10/g,
    'card !border-transparent relative z-10'
  );
  content = content.replace(
    /card p-8 md:p-10 relative z-10 bg-white/g,
    'card !border-transparent p-8 md:p-10 relative z-10'
  );

  // Add auth-input class to inputs
  content = content.replace(
    /className="w-full pl-10 pr-3 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-\[#3846e6\] transition-all"/g,
    'className="auth-input w-full pl-10 pr-3 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3846e6] transition-all"'
  );
  
  content = content.replace(
    /className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-\[#3846e6\] transition-all"/g,
    'className="auth-input w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3846e6] transition-all"'
  );
  
  content = content.replace(
    /className="w-full pl-12 pr-4 py-3\.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-\[#3846e6\] focus:border-transparent transition-all text-sm"/g,
    'className="auth-input w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3846e6] focus:border-transparent transition-all text-sm"'
  );

  // Add auth-button class to Google button
  content = content.replace(
    /className="w-full py-3 rounded-full border border-gray-200 bg-white text-sm font-medium transition-colors flex items-center justify-center gap-3 hover:bg-gray-50"/g,
    'className="auth-button w-full py-3 rounded-full border border-gray-200 bg-white text-sm font-medium transition-colors flex items-center justify-center gap-3 hover:bg-gray-50"'
  );

  fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/Login.jsx');
patchFile('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/Signup.jsx');
patchFile('c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/ForgotPassword.jsx');

console.log('Done patching auth ui issues');
