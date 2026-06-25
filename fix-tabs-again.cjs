const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/\{activeTab === "workouts" && <motion\.span initial=\{\{ opacity: 0, scale: 0\.8 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} className="text-\[10px\] mt-1 font-extrabold font-mono uppercase">Workout<\/motion\.span>\}/g,
  '<span className={`mt-1 font-extrabold font-mono uppercase transition-all duration-300 block text-center ${activeTab === "workouts" ? "text-[10px] opacity-100 scale-100" : "text-[8px] opacity-60 scale-90"}`}>Workout</span>');

file = file.replace(/\{activeTab === "history" && <motion\.span initial=\{\{ opacity: 0, scale: 0\.8 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} className="text-\[10px\] mt-1 font-extrabold font-mono uppercase">History<\/motion\.span>\}/g,
  '<span className={`mt-1 font-extrabold font-mono uppercase transition-all duration-300 block text-center ${activeTab === "history" ? "text-[10px] opacity-100 scale-100" : "text-[8px] opacity-60 scale-90"}`}>History</span>');

file = file.replace(/\{activeTab === "templates" && <motion\.span initial=\{\{ opacity: 0, scale: 0\.8 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} className="text-\[10px\] mt-1 font-extrabold font-mono uppercase">Routines<\/motion\.span>\}/g,
  '<span className={`mt-1 font-extrabold font-mono uppercase transition-all duration-300 block text-center ${activeTab === "templates" ? "text-[10px] opacity-100 scale-100" : "text-[8px] opacity-60 scale-90"}`}>Routines</span>');

file = file.replace(/\{activeTab === "exercises" && <motion\.span initial=\{\{ opacity: 0, scale: 0\.8 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} className="text-\[10px\] mt-1 font-extrabold font-mono uppercase">Library<\/motion\.span>\}/g,
  '<span className={`mt-1 font-extrabold font-mono uppercase transition-all duration-300 block text-center ${activeTab === "exercises" ? "text-[10px] opacity-100 scale-100" : "text-[8px] opacity-60 scale-90"}`}>Library</span>');

file = file.replace(/\{activeTab === "account" && <motion\.span initial=\{\{ opacity: 0, scale: 0\.8 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} className="text-\[10px\] mt-1 font-extrabold font-mono uppercase">\{state\.user \? "Account" : "Login"\}<\/motion\.span>\}/g,
  '<span className={`mt-1 font-extrabold font-mono uppercase transition-all duration-300 block text-center ${activeTab === "account" ? "text-[10px] opacity-100 scale-100" : "text-[8px] opacity-60 scale-90"}`}>{state.user ? "Account" : "Login"}</span>');

fs.writeFileSync('src/App.tsx', file, 'utf8');
