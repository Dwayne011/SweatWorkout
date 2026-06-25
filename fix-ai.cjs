const fs = require('fs');
let file = 'src/components/AIAssistant.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. the main container text color
content = content.replace('text-[#f1f1f5]', 'text-gray-900 dark:text-[#f1f1f5]');

// 2. the prose inversion
content = content.replace('className="prose prose-sm prose-invert"', 'className="prose prose-sm dark:prose-invert"');

// 3. timestamp text inside user bubble (purple bg)
content = content.replace('text-indigo-500 dark:text-indigo-200/80', 'text-indigo-200 dark:text-indigo-200/80');

// 4. loading text color
content = content.replace('text-slate-100 font-mono animate-pulse', 'text-gray-800 dark:text-slate-100 font-mono animate-pulse');

// 5. Error banner background
content = content.replace('bg-rose-950/50 border border-rose-500/20 text-rose-300', 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300');
content = content.replace('text-rose-200', 'text-rose-700 dark:text-rose-200');
content = content.replace('text-rose-300/90', 'text-rose-600 dark:text-rose-300/90');

// 6. HUD feedback text
content = content.replace('text-gray-900 dark:text-gray-100 tracking-wider', 'text-white tracking-wider');

// 7. Success banner background
content = content.replace('bg-emerald-950/40 border border-emerald-500/20 text-emerald-300', 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300');
content = content.replace('text-emerald-200', 'text-emerald-700 dark:text-emerald-200');
content = content.replace('text-emerald-300/90', 'text-emerald-600 dark:text-emerald-300/90');

fs.writeFileSync(file, content, 'utf8');
