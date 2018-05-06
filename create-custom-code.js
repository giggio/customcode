#!/usr/bin/env node
const { createCustomCode } = require('./lib/create');

const help = `create-custom-code - Creates a custom code directory named .code on your cwd.

Usage: create-custom-code <dir>`;
if (process.argv.length !== 3) {
    console.log(help);
    process.exit(1);
}
const baseDir = process.argv[2];
if (baseDir === '--help' || baseDir === '-h') {
    console.log(help);
    process.exit(0);
}
const created = createCustomCode(baseDir);
if (!created) process.exit(1);
