const fs = require('fs');
let file = fs.readFileSync('src/components/ExerciseLibrary.tsx', 'utf8');

file = file.replace(
  '<div className="bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/5 p-4 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">',
  '<div className="bg-white dark:bg-black w-full overflow-hidden shadow-sm shadow-md dark:shadow-none backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">'
);

fs.writeFileSync('src/components/ExerciseLibrary.tsx', file, 'utf8');
