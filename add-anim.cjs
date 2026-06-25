const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
css += `
@keyframes swipe-hint {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70% { transform: translateX(-4px); }
  20%, 40%, 60% { transform: translateX(4px); }
  80% { transform: translateX(0); }
}
.animate-swipe-hint {
  animation: swipe-hint 4s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
}
`;
fs.writeFileSync('src/index.css', css, 'utf8');
