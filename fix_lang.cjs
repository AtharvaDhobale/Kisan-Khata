const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix the broken Object.entries(languages) call - languages is an array, not an object
code = code.replace(
  `{Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}`,
  `{languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
              ))}`
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed languages dropdown!');
console.log('Dropdown now uses languages array correctly.');
