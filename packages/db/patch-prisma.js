const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, 'src', 'generated', 'client', 'index.js');
const runtimePath = path.join(__dirname, 'src', 'generated', 'client', 'runtime', 'library.js');

function patchFile(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Replace all occurrences of process.cwd() and __dirname with the turbopack ignore comment
    content = content.replace(/process\.cwd\(\)/g, '(/*turbopackIgnore: true*/ process.cwd())');
    content = content.replace(/__dirname/g, '(/*turbopackIgnore: true*/ __dirname)');
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

patchFile(clientPath);
patchFile(runtimePath);

console.log('✅ Patched Prisma Client and Runtime for Turbopack compatibility.');
