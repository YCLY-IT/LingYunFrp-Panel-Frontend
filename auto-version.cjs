const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

let version = pkg.version.trim();
let parts = version.split('.').map(Number);

for (let i = parts.length - 1; i >= 0; i--) {
  if (parts[i] < 9) {
    parts[i]++;
    break;
  } else {
    parts[i] = 0;
  }
}

pkg.version = parts.join('.');
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('版本号已自动更新为:', pkg.version); 