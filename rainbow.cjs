const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/from-indigo-500 to-purple-500/g, 'from-cyan-400 via-indigo-500 to-fuchsia-400 dark:from-indigo-500 dark:to-purple-500');

fs.writeFileSync('src/App.tsx', content, 'utf8');
