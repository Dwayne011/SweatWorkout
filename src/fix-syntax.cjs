const fs = require('fs');
let code = fs.readFileSync('src/components/ActiveWorkout.tsx', 'utf8');

// The string has variable whitespace, so we use a non-global relaxed regex just to be safe.
code = code.replace(/\{exerciseDetails\?.equipment === 'Barbell' && \(\s*\{\/\* Bar weight customizable config \*\/\}\s*(<div[\s\S]*?<\/div>)\s*\)\}/g,
"{exerciseDetails?.equipment === 'Barbell' && (\n$1\n)}");

code = code.replace(/bg-indigo-50 dark:bg-indigo-50 dark:bg-black\/35 text-indigo-600 dark:text-indigo-300/g, 'bg-indigo-50 dark:bg-black/35 text-indigo-600 dark:text-indigo-300');

fs.writeFileSync('src/components/ActiveWorkout.tsx', code, 'utf8');
console.log('done syntax');
