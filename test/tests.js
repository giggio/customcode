const { checkForCode, normalizeForWindows, getCodeFromPathEnv, findCode } = require("../lib/code");
const { consoleLogger } = require("../lib/consoleLogger");
const { tmpdir } = require("os");
const { mkdtempSync } = require("fs");
const { mkdirSync } = (fs = require("fs"));
const path = require("path");
const { sync: rimraf } = require("rimraf");
const { sync: mkdirp } = require("mkdirp");

describe("customcode that touches the fs, env.path and cwd", () => {
    let tempdir, cwd, envPath;
    before(() => {});
    beforeEach(() => {
        envPath = process.env.PATH;
        cwd = process.cwd();
        consoleLogger.redirectConsole();
        tempdir = mkdtempSync(path.join(tmpdir(), "test-custom-code-"));
    });
    afterEach(() => {
        process.env.PATH = envPath;
        process.chdir(cwd);
        rimraf(tempdir);
    });
    after(() => {
        consoleLogger.redirectConsole(false);
    });
    describe("checkForCode", () => {
        it("should not find code when it does not exist", () => {
            const [codeFound] = checkForCode(tempdir);
            codeFound.should.be.false;
        });
        it("should find code when it exists", () => {
            const codeTempPath = path.join(tempdir, "code");
            mkdirSync(codeTempPath);
            const codeTempFile = normalizeForWindows(path.join(codeTempPath, "code"));
            fs.closeSync(fs.openSync(codeTempFile, "w"));
            const [codeFound] = checkForCode(tempdir);
            codeFound.should.be.true;
        });
    });
    describe("getCodeFromPathEnv", () => {
        it("finds code in path when env.PATH is null", () => {
            process.env.PATH = "";
            const [codeFound] = getCodeFromPathEnv();
            consoleLogger.redirectedConsole.warn[0].should.equal("Code not found, PATH is empty.");
            codeFound.should.be.false;
        });
        it("finds code in path when code script is in PATH", () => {
            const newCodeTempDir = path.join(tempdir, "codenew");
            mkdirSync(newCodeTempDir);
            const newCodeTempFile = normalizeForWindows(path.join(newCodeTempDir, "code"));
            fs.closeSync(fs.openSync(newCodeTempFile, "w"));
            const originalCodeTempDir = path.join(tempdir, "codeoriginal");
            mkdirSync(originalCodeTempDir);
            const originalCodeTempFile = normalizeForWindows(
                path.join(originalCodeTempDir, "code")
            );
            fs.closeSync(fs.openSync(originalCodeTempFile, "w"));
            process.env.PATH = `${newCodeTempDir}${path.delimiter}${originalCodeTempDir}`;
            const [codeFound, codePath] = getCodeFromPathEnv();
            codeFound.should.be.true;
            codePath.should.equal(originalCodeTempFile);
        });
        it("finds only one code in path", () => {
            const newCodeTempDir = path.join(tempdir, "codenew");
            mkdirSync(newCodeTempDir);
            const newCodeTempFile = normalizeForWindows(path.join(newCodeTempDir, "code"));
            fs.closeSync(fs.openSync(newCodeTempFile, "w"));
            process.env.PATH = `${newCodeTempDir}`;
            const [codeFound] = getCodeFromPathEnv();
            consoleLogger.redirectedConsole.warn[0].should.equal("Code not found.");
            codeFound.should.be.false;
        });
    });
    describe("findCode", () => {
        it("finds Code in path", () => {
            const cwdIntermediaryTempDir = path.join(tempdir, "a", "b", "c");
            const codeTempDir = path.join(cwdIntermediaryTempDir, "code");
            mkdirp(codeTempDir);
            const codeTempFile = normalizeForWindows(path.join(codeTempDir, "code"));
            fs.closeSync(fs.openSync(codeTempFile, "w"));
            const cwdDir = path.join(cwdIntermediaryTempDir, "d", "e", "f");
            mkdirp(cwdDir);
            process.chdir(cwdDir);
            const [codeFound, codePath] = findCode();
            codeFound.should.be.true;
            codePath.should.equal(codeTempFile);
        });
    });
});

describe("customcode that does not touch the fs", () => {
    describe("normalizeForWindows", () => {
        it("should normalize path to windows and linux", () => {
            const normalized = normalizeForWindows(__dirname);
            if (process.platform === "win32") normalized.should.equal(`${__dirname}.cmd`);
            else normalized.should.equal(__dirname);
        });
    });
});
