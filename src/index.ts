#!/usr/bin/env node

export function main(): void {
  console.log('p5ss - p5.js screenshot tool');
  console.log('Version:', require('../package.json').version);
}

if (require.main === module) {
  main();
}
