const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/className="text-\[11px\] leading-tight mt-1 font-extrabold font-mono uppercase truncate w-full text-center px-0.5"/g, 'className="text-[9px] mt-1 font-extrabold font-mono uppercase"');
fs.writeFileSync('src/App.tsx', content, 'utf8');
