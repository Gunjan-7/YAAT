const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'src/app/(main)/(pages)/workflows/_actions/workflow-connections.tsx',
  'src/app/(main)/(pages)/settings/page.tsx',
  'src/app/(main)/(pages)/billing/_actions/payment-connecetions.tsx',
  'src/app/(main)/(pages)/billing/page.tsx',
  'src/app/(main)/(pages)/connections/page.tsx',
  'src/app/(main)/(pages)/connections/_actions/slack-connection.tsx',
  'src/app/(main)/(pages)/connections/_actions/notion-connection.tsx',
  'src/app/(main)/(pages)/connections/_actions/discord-connection.tsx'
];

// Update each file
filesToUpdate.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Read the file content
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Update import statement
  content = content.replace(
    /import\s+\{\s*(?:.*,\s*)?currentUser(?:\s*,\s*.*\s*)?\}\s+from\s+['"]@clerk\/nextjs['"]/g,
    (match) => {
      // Keep other imports if they exist
      if (match.includes(',')) {
        return match.replace(/,\s*currentUser|currentUser\s*,/g, '').replace(/\{\s*\}/g, '{ auth }') + '\nimport { auth } from \'@clerk/nextjs/server\'';
      }
      return 'import { auth } from \'@clerk/nextjs/server\'';
    }
  );
  
  // Update currentUser usage
  content = content.replace(
    /const\s+(?:user|authUser)\s*=\s*await\s+currentUser\(\)/g,
    'const { userId } = auth()\n  const user = userId ? { id: userId } : null'
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${filePath}`);
});

console.log('All files updated successfully!');
