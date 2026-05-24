const fs = require('fs');

const signupPath = 'c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/Signup.jsx';
let signupContent = fs.readFileSync(signupPath, 'utf8');

signupContent = signupContent.replace(
  /className=\{`min-h-screen w-full flex flex-col items-center justify-center p-4 \$\{[\s\S]*?`\}/m,
  'className={`min-h-screen w-full flex flex-col items-center justify-center p-4 gemini-canvas-gradient`}'
);

const oldInputClassSignup = /className=\{`w-full pl-10 pr-(?:3|10) py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 \$\{[\s\S]*?\}\`/g;
signupContent = signupContent.replace(
  oldInputClassSignup,
  (match) => {
    if (match.includes('pr-10')) {
      return 'className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3846e6] transition-all"';
    }
    return 'className="w-full pl-10 pr-3 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3846e6] transition-all"';
  }
);

signupContent = signupContent.replace(
  /className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-6"/,
  'className="primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-6"'
);

signupContent = signupContent.replace(
  /className=\{`w-full py-3 rounded-xl border text-sm transition-colors flex items-center justify-center gap-3 \$\{[\s\S]*?\}`\}/,
  'className="w-full py-3 rounded-full border border-gray-200 bg-white text-sm font-medium transition-colors flex items-center justify-center gap-3 hover:bg-gray-50"'
);

signupContent = signupContent.replace(
  /className="text-indigo-400 hover:text-indigo-300 font-medium"/,
  'className="text-[#3846e6] font-medium"'
);

fs.writeFileSync(signupPath, signupContent, 'utf8');

const forgotPath = 'c:/Users/ASUS/Dev/2026 Projects/JobAI-Frontend/src/views/ForgotPassword.jsx';
let forgotContent = fs.readFileSync(forgotPath, 'utf8');

forgotContent = forgotContent.replace(
  /className="min-h-screen bg-\[var\(--page-bg\)\] flex flex-col items-center justify-center p-4"/,
  'className="min-h-screen gemini-canvas-gradient flex flex-col items-center justify-center p-4"'
);

forgotContent = forgotContent.replace(
  /className="w-full pl-12 pr-4 py-3\.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"/,
  'className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3846e6] focus:border-transparent transition-all text-sm"'
);

forgotContent = forgotContent.replace(
  /className="w-full py-3\.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"/,
  'className="primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"'
);

forgotContent = forgotContent.replace(
  /className="w-full py-3\.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all"/,
  'className="primary w-full py-3.5"'
);

forgotContent = forgotContent.replace(
  /className="text-indigo-600 hover:underline"/,
  'className="text-[#3846e6] hover:underline font-medium"'
);

fs.writeFileSync(forgotPath, forgotContent, 'utf8');

console.log('Done patching auth files');
