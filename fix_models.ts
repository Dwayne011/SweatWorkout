import fs from 'fs';
const data = fs.readFileSync('server.ts', 'utf8');
fs.writeFileSync('server.ts', data.replace(/gemini-3\.5-flash/g, 'gemini-2.5-flash'));
