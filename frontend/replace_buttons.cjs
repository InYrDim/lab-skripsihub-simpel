const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  const normalizedPath = filePath.replace(/\\/g, '/');
  // skip the button and select components themselves, as well as LoginPage and RegisterPage since we already did those.
  if (normalizedPath.includes('components/ui/button.tsx')) return;
  if (normalizedPath.includes('components/ui/select.tsx')) return;
  if (normalizedPath.includes('pages/LoginPage.tsx')) return;
  if (normalizedPath.includes('pages/RegisterPage.tsx')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<button') || content.includes('</button>')) {
    // Replace tags
    content = content.replace(/<button/g, '<Button');
    content = content.replace(/<\/button>/g, '</Button>');
    
    // Add import if not present
    if (!content.includes('import { Button }')) {
      const lastImportIndex = content.lastIndexOf('import ');
      const relativePath = path.relative(path.dirname(filePath), './src/components/ui/button').replace(/\\/g, '/');
      const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      const importStatement = `import { Button } from '${importPath}';\n`;

      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
      } else {
        content = importStatement + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced buttons in ${filePath}`);
  }
});
console.log('Migration complete!');
