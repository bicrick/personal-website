const purify = require('purify-css');
const fs = require('fs');
const path = require('path');

// Content files to analyze for CSS usage
const content = [
  'src/**/*.js',
  'src/**/*.jsx',
  'public/index.html'
];

// CSS files to purify
const css = ['src/App.css'];

const options = {
  info: true,        // Show size reduction stats
  rejected: false,   // Don't spam with all rejected selectors (set to true if you want to see them)
  minify: true,      // Also minify the output
  output: 'src/App.purified.css'  // Output to a new file
};

console.log('\n🔍 Starting CSS purification...\n');
console.log('Analyzing files:');
console.log('  - src/**/*.js');
console.log('  - src/**/*.jsx');
console.log('  - public/index.html');
console.log('\nPurifying: src/App.css\n');

// Get original file size
const originalSize = fs.statSync('src/App.css').size;
console.log(`Original CSS size: ${(originalSize / 1024).toFixed(2)} KB`);

purify(content, css, options, function(purifiedCSS) {
  console.log(`\nPurified CSS written to: src/App.purified.css`);
  
  const purifiedSize = fs.statSync('src/App.purified.css').size;
  const reduction = ((originalSize - purifiedSize) / originalSize * 100).toFixed(2);
  
  console.log(`Purified CSS size: ${(purifiedSize / 1024).toFixed(2)} KB`);
  console.log(`\n✨ Reduction: ${reduction}% (saved ${((originalSize - purifiedSize) / 1024).toFixed(2)} KB)\n`);
  
  console.log('Next steps:');
  console.log('  1. Review src/App.purified.css to make sure it looks good');
  console.log('  2. If satisfied, replace src/App.css with the purified version');
  console.log('  3. Test your app to ensure nothing broke\n');
});

