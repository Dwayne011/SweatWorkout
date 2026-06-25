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
    content = content.replace(/dark:bg-gray-100\s*/g, '');
    content = content.replace(/dark:shadow-none\/80\s*/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
