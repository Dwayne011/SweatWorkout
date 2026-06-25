const fs = require('fs');
let file = fs.readFileSync('src/components/ExerciseLibrary.tsx', 'utf8');

file = file.replace(
  '<div className="p-2.5 bg-gray-200 dark:bg-black dark:border-white/10 shadow-sm text-indigo-450 rounded-xl border border-gray-200 dark:border-white/5 shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:text-indigo-300 transition-colors">\n                  <Dumbbell className="w-4 h-4" />\n                </div>\n                <div>',
  '<div className="p-2.5 bg-gray-200 dark:bg-black dark:border-white/10 shadow-sm text-indigo-450 rounded-xl border border-gray-200 dark:border-white/5 shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:text-indigo-300 transition-colors">\n                  <Dumbbell className="w-4 h-4" />\n                </div>\n                <div className="flex-1 min-w-0">'
);
fs.writeFileSync('src/components/ExerciseLibrary.tsx', file, 'utf8');
