#!/usr/bin/env node
const { findCode, runCode } = require("./lib/code");

function main() {
    const [codeFound, codePath] = findCode();
    if (codeFound) {
        let [, , ...args] = process.argv;
        runCode(codePath, args);
    } else {
        process.exit(1);
    }
}

main();