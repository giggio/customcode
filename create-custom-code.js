#!/usr/bin/env node
const { getCodeFromPathEnv } = require("./lib/code");
const { basename, join: pathJoin, dirname, resolve } = require("path");
const { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } = require("fs");
const { consoleLogger } = require("./lib/consoleLogger");

function createCustomCode(newCodeDir) {
    const [codeFound, codePath] = getCodeFromPathEnv();
    if (!codeFound) process.exit(1);
    const originalCodeScriptContents = readFileSync(codePath, "utf8");
    const codeBaseName = basename(codePath);
    const newCodePath = pathJoin(newCodeDir, codeBaseName);
    const codeBasePath = dirname(dirname(codePath));
    const newUserDataDir = pathJoin(newCodeDir, "userdatadir");
    mkdirSync(newUserDataDir);
    const newExtensionsDir = pathJoin(newCodeDir, "extensionsdir");
    mkdirSync(newExtensionsDir);
    const cliJs = pathJoin(codeBasePath, "resources", "app", "out", "cli.js");
    let newCodeScriptContents =
        process.platform === "win32"
            ? createNewCodeScriptContentsForWindows(
                  originalCodeScriptContents,
                  codeBasePath,
                  cliJs,
                  newUserDataDir,
                  newExtensionsDir
              )
            : createNewCodeScriptContentsForLinux(codeBasePath, newUserDataDir, newExtensionsDir);
    writeFileSync(newCodePath, newCodeScriptContents, "utf8");
    chmodSync(newCodePath, 0o775);
}

function createNewCodeScriptContentsForWindows(
    originalCodeScriptContents,
    codeBasePath,
    cliJs,
    newUserDataDir,
    newExtensionsDir
) {
    const codeExe = pathJoin(codeBasePath, "Code.exe");
    let newCodeScriptContents = "";
    for (let line of originalCodeScriptContents.split("\n")) {
        if (line.startsWith("call"))
            line = `call "${codeExe}" "${cliJs}" --user-data-dir "${newUserDataDir}" --extensions-dir "${newExtensionsDir}" %*`;
        newCodeScriptContents += line + "\n";
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
    const codeDir = pathJoin(baseDir, "code");
    if (existsSync(codeDir)) {
        consoleLogger.warn(`Directory ${codeDir} already exists.`);
        return [false];
    }
    mkdirSync(codeDir);
    return [true, codeDir];
}

const [, , baseDir] = process.argv;
const [created, codeDir] = createCodeDir(baseDir);
if (!created) process.exit(1);
createCustomCode(codeDir);
