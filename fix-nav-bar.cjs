const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/gap-2 bg-gray-100 dark:bg-black dark:border-white\/10 shadow-sm/g, 'bg-gray-100 dark:bg-black dark:border-white/10 shadow-sm gap-1 md:gap-2');
file = file.replace(/px-2 py-3 flex items-center justify-around gap-/g, 'px-2 py-3 flex items-center justify-between gap-');
file = file.replace(/md:max-w-lg/g, 'md:max-w-md');

fs.writeFileSync('src/App.tsx', file, 'utf8');
