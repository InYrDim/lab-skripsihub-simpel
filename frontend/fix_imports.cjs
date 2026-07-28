const fs = require('fs');

const files = [
  'src/pages/AdminDashboard.tsx',
  'src/pages/AdminManagement.tsx',
  'src/pages/SubmissionListPage.tsx',
  'src/pages/ValidatorDashboard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match `import {\nimport { Button } from '...';`
  // We'll just search for `import { Button } from` and move it to the top.
  const buttonImportRegex = /import \{ Button \} from '[^']+';\n/g;
  
  // extract the import
  const matches = content.match(buttonImportRegex);
  if (matches) {
    // remove all instances
    content = content.replace(buttonImportRegex, '');
    // add it right after the first line (import React...)
    const firstLineEnd = content.indexOf('\n');
    content = content.slice(0, firstLineEnd + 1) + matches[0] + content.slice(firstLineEnd + 1);
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed imports in ${file}`);
  }
});
