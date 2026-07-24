const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/indigo-/g, 'orange-');
  newContent = newContent.replace(/bg-zinc-50 /g, 'bg-white ');
  newContent = newContent.replace(/bg-zinc-50"/g, 'bg-white"');
  newContent = newContent.replace(/dark:bg-zinc-900 /g, 'dark:bg-zinc-950 ');
  newContent = newContent.replace(/dark:bg-zinc-900"/g, 'dark:bg-zinc-950"');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated', filePath);
  }
}

function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkSync(dirPath, callback);
    } else if (dirPath.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

walkSync('C:\\Users\\iyede\\code\\__lab__\\skripsihub\\frontend\\src', replaceInFile);
