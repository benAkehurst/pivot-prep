const fs = require('fs');

const sourceFile = 'env.delete';
const targetFile = '.env.local';

if (!fs.existsSync(sourceFile)) {
  console.error(`${sourceFile} file not found!`);
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  fs.copyFileSync(sourceFile, targetFile);
  console.log(
    `${targetFile} file created with demo values. Please update it with the correct values.`
  );
} else {
  console.log(`${targetFile} already exists. No changes made.`);
}
