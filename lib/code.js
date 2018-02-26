const path = require("path");
const { realpathSync, existsSync } = require("fs");
const { spawn } = require("child_process");
const { consoleLogger } = require("./consoleLogger");

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
        const [codeFound, codePath] = checkForCode(currentPath);
        if (codeFound) return [codeFound, codePath];
        if (parsed.root === currentPath) searchedAll = true;
        else currentPath = path.normalize(`${currentPath}${path.sep}..`);
    } while (!searchedAll);
    return getCodeFromPathEnv();
}

function getCodeFromPathEnv() {
    const pathEnv = process.env.PATH;
    if (!pathEnv) {
        consoleLogger.warn("Code not found, PATH is empty.");
        return [false];
    }
    const paths = pathEnv.split(path.delimiter);
    const codePaths = [];
    for (const apath of paths) {
        const codePath = normalizeForWindows(path.join(apath, "code"));
        if (existsSync(codePath)) codePaths.push(codePath);
    }
    if (codePaths.length < 2) {
        consoleLogger.warn("Code not found.");
        return [false];
    }
    const codePath = realpathSync(codePaths[1]); //skip first which should be ourselves, todo: a better way to check who is ourselves
    return [true, codePath];
}

function checkForCode(currentPath) {
    const codePath = normalizeForWindows(path.join(currentPath, "code", "code"));
    if (existsSync(codePath)) return [true, codePath];
    return [false];
}

function normalizeForWindows(path) {
    return process.platform === "win32" ? `${path}.cmd` : path;
}

module.exports = { runCode, findCode, getCodeFromPathEnv, checkForCode, normalizeForWindows };