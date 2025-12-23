#!/usr/bin/env node

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json') as { version: string };

export function main(): void {
  console.log('p5ss - p5.js screenshot tool');
  console.log('Version:', packageJson.version);
}

if (require.main === module) {
  main();
}
