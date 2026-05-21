const fs = require('fs');
const path = require('path');

const partsDir = path.join(__dirname, 'parts');
const outputPath = path.join(__dirname, 'schema.prisma');

const files = fs
  .readdirSync(partsDir)
  .filter((f) => f.endsWith('.prisma'))
  .sort();

let merged = '';
for (const file of files) {
  const content = fs.readFileSync(path.join(partsDir, file), 'utf-8');
  merged += content.trim() + '\n\n';
}

fs.writeFileSync(outputPath, merged.trim() + '\n');
console.log(`✓ Merged ${files.length} schema files into schema.prisma`);
