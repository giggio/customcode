#!/usr/bin/env node
const { getCodeFromPathEnv, codeDirName } = require('./code');
const { basename, join: pathJoin, dirname, resolve } = require('path');
const { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } = require('fs');
const { consoleLogger } = require('./consoleLogger');

function createCustomCodeFile(newCodeDir) {
    const [codeFound, codePath] = getCodeFromPathEnv();
    if (!codeFound) return false;
    const originalCodeScriptContents = readFileSync(codePath, 'utf8');
    const codeBaseName = basename(codePath);
    const newCodePath = pathJoin(newCodeDir, `c${codeBaseName}`);
    const codeBasePath = dirname(dirname(codePath));
    const newUserDataDir = pathJoin(newCodeDir, 'userdatadir');
    mkdirSync(newUserDataDir);
    const newExtensionsDir = pathJoin(newCodeDir, 'extensionsdir');
    mkdirSync(newExtensionsDir);
    const cliJs = pathJoin(codeBasePath, 'resources', 'app', 'out', 'cli.js');
    let newCodeScriptContents =
        process.platform === 'win32'
            ? createNewCodeScriptContentsForWindows(
                  originalCodeScriptContents,
                  codeBasePath,
                  cliJs,
                  newUserDataDir,
                  newExtensionsDir
              )
            : createNewCodeScriptContentsForLinux(codeBasePath, newUserDataDir, newExtensionsDir);
    writeFileSync(newCodePath, newCodeScriptContents, 'utf8');
    chmodSync(newCodePath, 0o775);
    return true;
}

function createNewCodeScriptContentsForWindows(
    originalCodeScriptContents,
    codeBasePath,
    cliJs,
    newUserDataDir,
    newExtensionsDir
) {
    const codeExe = pathJoin(codeBasePath, 'Code.exe');
    let newCodeScriptContents = '';
    for (let line of originalCodeScriptContents.split('\n')) {
        if (line.startsWith('call'))
            line = `call "${codeExe}" "${cliJs}" --user-data-dir "${newUserDataDir}" --extensions-dir "${newExtensionsDir}" %*`;
        newCodeScriptContents += line + '\n';
    }
    return newCodeScriptContents;
}

function createNewCodeScriptContentsForLinux(codeBasePath, newUserDataDir, newExtensionsDir) {
    let newCodeScriptContents = `#!/usr/bin/env bash
VSCODE_PATH="${codeBasePath}"
ELECTRON="$VSCODE_PATH/code"
CLI="$VSCODE_PATH/resources/app/out/cli.js"
ELECTRON_RUN_AS_NODE=1 "$ELECTRON" "$CLI" --user-data-dir "${newUserDataDir}" --extensions-dir "${newExtensionsDir}" "$@"
exit $?`;
    return newCodeScriptContents;
}

function createCodeDir(baseDir = process.cwd()) {
    baseDir = resolve(baseDir);
    if (!existsSync(baseDir)) {
        consoleLogger.warn(`Target directory '${baseDir}' does not exist.`);
        return [false];
    }
    const codeDir = pathJoin(baseDir, codeDirName);
    if (existsSync(codeDir)) {
        consoleLogger.warn(`Directory '${codeDir}' already exists.`);
        return [false];
    }
    mkdirSync(codeDir);
    return [true, codeDir];
}

function createCustomCode(baseDir) {
    const [created, codeDir] = createCodeDir(baseDir);
    if (!created) return false;
    return createCustomCodeFile(codeDir);
}

module.exports = { createCodeDir, createCustomCodeFile, createCustomCode };
