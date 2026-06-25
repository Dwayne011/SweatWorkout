const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/text-\[10px\] opacity-100 scale-100" : "text-\[8px\] opacity-60 scale-90/g, 'text-[11px] opacity-100 scale-110 origin-top" : "text-[8px] opacity-30 origin-top scale-75');

fs.writeFileSync('src/App.tsx', file, 'utf8');
