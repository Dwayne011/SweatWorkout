const fs = require('fs');
let file = fs.readFileSync('src/components/ExerciseLibrary.tsx', 'utf8');

// fix search box wrapping
file = file.replace(
  '<div className="bg-white dark:bg-black w-full rounded-2xl border border-gray-200 dark:border-white/10 p-3 md:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">',
  '<div className="bg-white dark:bg-black w-full max-w-[100vw] overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3">'
);

// fix categories scrolling (add a wiggle animation class and ensure scrolling layout)
file = file.replace(
  '<div className="flex items-center gap-2 overflow-x-auto pb-2 invisible-scrollbar w-full max-w-full">',
  '<div className="flex items-center gap-2 overflow-x-auto pb-4 invisible-scrollbar w-full max-w-full touch-pan-x animate-[swipe-hint_4s_ease-in-out_infinite] hover:animate-none">'
);

// fix text going off screen & breaking it down over two lines
file = file.replace(
  '<div className="flex items-center space-x-3.5">',
  '<div className="flex flex-row items-center space-x-3.5 flex-1 min-w-0 pr-3">'
);

file = file.replace(
  '<div className="p-2.5 bg-gray-200 dark:bg-black dark:border-white/10 shadow-sm text-indigo-450 rounded-xl border border-gray-200 dark:border-white/5 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:text-indigo-300 transition-colors">',
  '<div className="p-2.5 bg-gray-200 dark:bg-black dark:border-white/10 shadow-sm text-indigo-450 rounded-xl border border-gray-200 dark:border-white/5 shrink-0 group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:text-indigo-300 transition-colors">'
);

let changedH4 = file.replace(
  '<h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center gap-1.5 group-hover:text-indigo-205 transition-colors">',
  '<h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base flex flex-wrap items-center gap-1.5 group-hover:text-indigo-400 transition-colors leading-snug">'
);

if (changedH4 !== file) {
  file = changedH4;
} else {
  // Try alternative
  file = file.replace(
    /className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base flex items-center gap-1\.5 group-hover:text-indigo-[0-9]+ transition-colors"/g,
    'className="font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base flex flex-wrap items-center gap-1.5 group-hover:text-indigo-400 transition-colors leading-snug"'
  );
}

// target span for text wrap
file = file.replace(
  '<span>{item.name}</span>',
  '<span className="whitespace-normal break-words flex-1 min-w-0">{item.name}</span>'
);

// fix container parent
file = file.replace(
  '<div className="space-y-4 pb-40" id="exercise-library-container">',
  '<div className="space-y-4 pb-40 w-full max-w-full overflow-hidden" id="exercise-library-container">'
);


// ensure the main div mapping has width limitations
file = file.replace(
  '<div\n              key={item.id}\n              onClick={() => openExerciseGuide(item)}\n              className="p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group"',
  '<div\n              key={item.id}\n              onClick={() => openExerciseGuide(item)}\n              className="p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group w-full"'
);

fs.writeFileSync('src/components/ExerciseLibrary.tsx', file, 'utf8');
