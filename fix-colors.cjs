const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
        walkDir(dirPath, callback)
    } else {
        callback(path.join(dir, f));
    }
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace standalone text-indigo-300 with text-indigo-600 dark:text-indigo-300
    content = content.replace(/(?<!dark:)text-indigo-300/g, 'text-indigo-600 dark:text-indigo-300');
    // For text-indigo-200 -> text-indigo-500 dark:text-indigo-200
    content = content.replace(/(?<!dark:)text-indigo-200/g, 'text-indigo-500 dark:text-indigo-200');
    
    // Convert dark:text-indigo-600 dark:text-indigo-300 mistakes
    content = content.replace(/dark:text-indigo-600 dark:text-indigo-300/g, 'dark:text-indigo-300');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
