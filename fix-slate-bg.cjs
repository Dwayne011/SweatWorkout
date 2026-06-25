const fs = require('fs');
let file = fs.readFileSync('src/components/WorkoutAnalytics.tsx', 'utf8');

file = file.replace(/bg-slate-900/g, 'bg-gray-100 dark:bg-slate-900');
file = file.replace(/bg-slate-950/g, 'bg-white dark:bg-slate-950');

fs.writeFileSync('src/components/WorkoutAnalytics.tsx', file, 'utf8');
