const fs = require('fs');
let content = fs.readFileSync('src/components/ActiveWorkout.tsx', 'utf8');

// I will do generic replaces safely:
content = content.replace(/bg-black\/35 text-indigo-600 dark:text-indigo-300/g, 'bg-indigo-50 dark:bg-black/35 text-indigo-600 dark:text-indigo-300');
content = content.replace(/bg-black\/85 z-\[9999\]/g, 'bg-gray-900/60 dark:bg-black/85 z-[9999]');
content = content.replace(/from-transparent to-rose-600\/30/g, 'from-transparent to-rose-500/20 dark:to-rose-600/30');

// "bg-gradient-to-tr from-[#1a1a24] to-[#121219]"
content = content.replace(/from-\[#1a1a24\] to-\[#121219\]/g, 'from-gray-100 dark:from-[#1a1a24] to-gray-50 dark:to-[#121219]');

// The main header: bg-indigo-950 border-b border-indigo-500/30
content = content.replace(/className="bg-indigo-950 border-b border-indigo-500\/30 overflow-hidden"/g, 'className="bg-indigo-600 dark:bg-indigo-950 border-b border-indigo-700 dark:border-indigo-500/30 overflow-hidden"');

content = content.replace(/<div className="overflow-x-auto invisible-scrollbar">/g, '<div className="overflow-x-auto invisible-scrollbar px-1 sm:px-2">');

fs.writeFileSync('src/components/ActiveWorkout.tsx', content, 'utf8');
console.log('done!');
