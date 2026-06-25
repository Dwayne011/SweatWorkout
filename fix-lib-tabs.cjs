const fs = require('fs');
let file = fs.readFileSync('src/components/ExerciseLibrary.tsx', 'utf8');

const targetStr = `      {/* Categories Horizontal Scrolling tabs */}
      <div className="w-full relative min-w-0 overflow-hidden group">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 invisible-scrollbar w-full snap-x snap-mandatory animate-swipe-wiggle group-hover:animate-none group-active:animate-none touch-pan-x min-w-0 overflow-y-hidden" style={{ WebkitOverflowScrolling: "touch" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={\`snap-center px-4 py-2 text-xs rounded-xl font-bold font-mono uppercase tracking-wide shrink-0 transition-all cursor-pointer \${
              categoryFilter === cat
                ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-gray-900 dark:text-gray-100 shadow-lg border border-indigo-500/30"
                : "bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none border border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:border-white/10 hover:text-gray-900 dark:text-gray-100"
            }\`}
          >
            {cat}
          </button>
        ))}
      </div>

        </div>`;

const replacementStr = `      {/* Categories Horizontal Scrolling tabs */}
      <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-full relative min-w-0 group rounded-xl">
        <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white/80 dark:from-black/80 to-transparent pointer-events-none z-10 flex items-center justify-end pr-1 md:hidden">
            <ChevronRight className="w-4 h-4 text-indigo-500 opacity-60 animate-swipe-wiggle" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-4 invisible-scrollbar w-full touch-pan-x min-w-0 overflow-y-hidden" style={{ WebkitOverflowScrolling: "touch", paddingRight: "40px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={\`px-4 py-2 text-xs rounded-xl font-bold font-mono uppercase tracking-wide shrink-0 transition-all whitespace-nowrap cursor-pointer touch-manipulation \${
                categoryFilter === cat
                  ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-gray-900 dark:text-gray-100 shadow-lg border border-indigo-500/30"
                  : "bg-white dark:bg-black dark:border-white/10 shadow-sm shadow-inner shadow-md dark:shadow-none border border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 hover:border-gray-200 dark:border-white/10 hover:text-gray-900 dark:text-gray-100"
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>`;

if (!file.includes(targetStr)) {
    console.error("String not found! Trying fallback...");
    file = file.replace(
      /{[^}]*Categories Horizontal Scrolling tabs[^}]*}\s*<div[^>]*w-full relative min-w-0 overflow-hidden group[^>]*>[\s\S]*?<\/div>\s*<\/div>/g,
      replacementStr
    );
} else {
    file = file.replace(targetStr, replacementStr);
}

// Ensure ChevronRight is imported
if (!file.includes('ChevronRight')) {
  file = file.replace(
    /import \{\s*Dumbbell/,
    'import {\n  ChevronRight,\n  Dumbbell'
  );
}

fs.writeFileSync('src/components/ExerciseLibrary.tsx', file, 'utf8');
