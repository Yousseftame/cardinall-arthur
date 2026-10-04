const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Remove style={{ fontFamily: ... }}
  content = content.replace(/style=\{\{\s*fontFamily:\s*[^}]+\}\}/g, '');
  content = content.replace(/fontFamily:\s*(?:'[^']+'|"[^"]+"|`[^`]+`)(?:,\s*)?/g, '');
  content = content.replace(/style=\{\{\s*\}\}/g, '');
  content = content.replace(/style=\{\{\s*,\s*/g, 'style={{ ');

  // 2. Headings: make them font-heading, font-light, tracking-tighter
  const headingRegex = /<(h[1-6])[^>]*className=["']([^"']+)["'][^>]*>/g;
  content = content.replace(headingRegex, (match, tag, className) => {
    let newClass = className;
    newClass = newClass.replace(/\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, '');
    newClass = newClass.replace(/\btracking-(tighter|tight|normal|wide|wider|widest)\b/g, '');
    
    if (!newClass.includes('font-heading')) {
      newClass += ' font-heading';
    }
    
    newClass += ' font-light tracking-tighter';
    newClass = newClass.replace(/\s+/g, ' ').trim();
    
    return match.replace(className, newClass);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles++;
  }
});

console.log('Modified ' + modifiedFiles + ' files.');
