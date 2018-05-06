const path = require('path');
const { realpathSync, existsSync } = require('fs');
const { spawn } = require('child_process');
const { consoleLogger } = require('./consoleLogger');

const codeDirName = '.code';
const codeBinName = 'code';
const ccodeBinName = 'ccode';

function runCode(codePath, args) {
    spawn(`"${codePath}"`, args, {
        shell: true,
        cwd: process.cwd()
    });
}

function findCode() {
    let currentPath = process.cwd();
    let searchedAll = false;
    do {
        const parsed = path.parse(currentPath);
        const codeDir = path.join(currentPath, codeDirName);
        const [codeFound, codePath] = searchCode(codeDir, ccodeBinName);
        if (codeFound) return [codeFound, codePath];
        if (parsed.root === currentPath) searchedAll = true;
        else currentPath = path.normalize(`${currentPath}${path.sep}..`);
    } while (!searchedAll);
    return getCodeFromPathEnv();
}

/**
 * @returns {([boolean, string])}
 */
function getCodeFromPathEnv() {
    const pathEnv = process.env.PATH;
    if (!pathEnv) {
        consoleLogger.warn('Code not found, PATH is empty.');
        return [false, undefined];
    }
    const paths = pathEnv.split(path.delimiter);
    for (const apath of paths) {
        const [codeFound, codePath] = searchCode(apath, codeBinName);
        if (codeFound)
            return [codeFound, codePath];
    }
    consoleLogger.warn('Code not found.');
    return [false, undefined];
}

/**
 * @returns {([boolean, string])}
 */
function searchCode(apath, codeName) {
    const codePath = normalizeForWindows(path.join(apath, codeName));
    //console.log(`Searching at ${codePath}`)
    if (existsSync(codePath)) return [true, realpathSync(codePath)];
    return [false, undefined];
}

function normalizeForWindows(path) {
    return process.platform === 'win32' ? `${path}.cmd` : path;
}

module.exports = { runCode, findCode, getCodeFromPathEnv, normalizeForWindows, searchCode, codeDirName, codeBinName, ccodeBinName };
