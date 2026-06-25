const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

// For Workout
file = file.replace(/<span className="text-\[9px\] mt-1 font-extrabold font-mono uppercase">Workout<\/span>/g,
  '{activeTab === "workouts" && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] mt-1 font-extrabold font-mono uppercase">Workout</motion.span>}');

// For History
file = file.replace(/<span className="text-\[9px\] mt-1 font-extrabold font-mono uppercase">History<\/span>/g,
  '{activeTab === "history" && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] mt-1 font-extrabold font-mono uppercase">History</motion.span>}');

// For Routines
file = file.replace(/<span className="text-\[9px\] mt-1 font-extrabold font-mono uppercase">Routines<\/span>/g,
  '{activeTab === "templates" && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] mt-1 font-extrabold font-mono uppercase">Routines</motion.span>}');

// For Library
file = file.replace(/<span className="text-\[9px\] mt-1 font-extrabold font-mono uppercase">Library<\/span>/g,
  '{activeTab === "exercises" && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] mt-1 font-extrabold font-mono uppercase">Library</motion.span>}');

// For Account
file = file.replace(/<span className="text-\[9px\] mt-1 font-extrabold font-mono uppercase">\s*\{state\.user \? "Account" : "Login"\}\s*<\/span>/g,
  '{activeTab === "account" && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] mt-1 font-extrabold font-mono uppercase">{state.user ? "Account" : "Login"}</motion.span>}');

// Also update padding of the container
file = file.replace(/className="px-2 py-2 flex items-center justify-around bg-gray-100 dark:bg-black dark:border-white\/10 shadow-sm"/g,
'className="px-2 py-3 flex items-center justify-around gap-2 bg-gray-100 dark:bg-black dark:border-white/10 shadow-sm"');

fs.writeFileSync('src/App.tsx', file, 'utf8');
