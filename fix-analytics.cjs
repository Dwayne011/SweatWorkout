const fs = require('fs');
let file = fs.readFileSync('src/components/WorkoutAnalytics.tsx', 'utf8');
file = file.replace(/bg-gradient-to-br from-white\/3 to-white\/\[0\.01\]/g, 'bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 shadow-sm shadow-inner');
fs.writeFileSync('src/components/WorkoutAnalytics.tsx', file, 'utf8');
