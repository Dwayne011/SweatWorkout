const fs = require('fs');
let file = fs.readFileSync('src/components/ExerciseLibrary.tsx', 'utf8');

// Ensure the exercise library container has overflow-hidden, and the scroll container explicitly has max-width of 100%.

file = file.replace(
  '<div className="space-y-4 pb-40 w-full max-w-full overflow-hidden" id="exercise-library-container">',
  '<div className="space-y-4 pb-40 w-full max-w-full overflow-x-hidden min-w-0" id="exercise-library-container">\n      <style>\n        {`\n          @keyframes swipe-wiggle {\n            0%, 50%, 100% { transform: translateX(0); }\n            10%, 30% { transform: translateX(-8px); }\n            20%, 40% { transform: translateX(8px); }\n          }\n          .animate-swipe-wiggle {\n            animation: swipe-wiggle 4s ease-in-out infinite;\n          }\n        `}\n      </style>'
);

// We should remove the animation from the scroll container itself and apply it just as an initial class maybe?
file = file.replace(
  'animate-[swipe-hint_4s_ease-in-out_infinite] hover:animate-none',
  ''
);

// Search wrapper
file = file.replace(
  '<div className="bg-white dark:bg-black w-full max-w-[100vw] overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3">',
  '<div className="bg-white dark:bg-black w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 min-w-0">'
);

// Add animation to the wrapper
file = file.replace(
  '{/* Categories Horizontal Scrolling tabs */}',
  '{/* Categories Horizontal Scrolling tabs */}\n      <div className="w-full relative min-w-0 overflow-hidden group">'
);

// Change the scroll container
file = file.replace(
  '<div className="flex items-center gap-2 overflow-x-auto pb-4 invisible-scrollbar w-full max-w-full touch-pan-x ">',
  '<div className="flex items-center gap-2 overflow-x-auto pb-4 invisible-scrollbar w-full snap-x snap-mandatory animate-swipe-wiggle group-hover:animate-none group-active:animate-none touch-pan-x min-w-0 overflow-y-hidden" style={{ WebkitOverflowScrolling: "touch" }}>'
);

// the snap-align
file = file.replace(
  'className={`px-4 py-2 text-xs rounded-xl font-bold font-mono uppercase tracking-wide shrink-0 transition-all cursor-pointer ${',
  'className={`snap-center px-4 py-2 text-xs rounded-xl font-bold font-mono uppercase tracking-wide shrink-0 transition-all cursor-pointer ${'
);

// fix the flex wrapper closing tag for categories
file = file.replace(
  '    {/* Grid List with inline Edit button for custom exercises */}',
  '      </div>\n\n      {/* Grid List with inline Edit button for custom exercises */}'
);

fs.writeFileSync('src/components/ExerciseLibrary.tsx', file, 'utf8');
