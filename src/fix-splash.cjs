const fs = require('fs');
let code = fs.readFileSync('src/components/WorkoutSplashScene.tsx', 'utf8');

// 1. Vector Map wrapper
code = code.replace(/bg-slate-900 border border-slate-800/g, 'bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800');

// 2. SVG active elements
code = code.replace(/fill-\[#1b1b2f\]/g, 'fill-gray-200 dark:fill-[#1b1b2f]');
code = code.replace(/fill-\[#141424\]/g, 'fill-gray-100 dark:fill-[#141424]');

fs.writeFileSync('src/components/WorkoutSplashScene.tsx', code, 'utf8');
console.log('splash done');
