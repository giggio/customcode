const { searchCode, normalizeForWindows, getCodeFromPathEnv, findCode, codeDirName, codeBinName, ccodeBinName } = require('../lib/code');
const { createCodeDir, createCustomCodeFile, createCustomCode } = require('../lib/create');
const { consoleLogger } = require('../lib/consoleLogger');
const { tmpdir } = require('os');
const { mkdtempSync, mkdirSync, existsSync } = require('fs');
const fs = require('fs');
const path = require('path');
const { sync: rimraf } = require('rimraf');
const { sync: mkdirp } = require('mkdirp');
const { expect } = require('chai');

describe('customcode that touches the fs, env.path and cwd', () => {
    let tempdir, cwd, envPath;
    const isTravisOnAMac = process.env.TRAVIS_OS_NAME === 'osx';
    before(() => {});
    beforeEach(() => {
        envPath = process.env.PATH;
        cwd = process.cwd();
        consoleLogger.redirectConsole();
        tempdir = mkdtempSync(path.join(tmpdir(), 'test-custom-code-'));
    });
    afterEach(() => {
        process.env.PATH = envPath;
        process.chdir(cwd);
        rimraf(tempdir);
    });
    after(() => {
        consoleLogger.redirectConsole(false);
    });
    describe('searchCode', () => {
        it('should not find code when it does not exist', () => {
            const codeTempPath = path.join(tempdir, 'searchCode');
            process.env.PATH = codeTempPath;
            const [codeFound] = searchCode(tempdir, codeBinName);
            codeFound.should.be.false;
        });
        it(`should find ${ccodeBinName} when it exists`, () => {
            const codeTempPath = path.join(tempdir, 'shouldfind');
            mkdirSync(codeTempPath);
            const codeTempFile = normalizeForWindows(path.join(codeTempPath, ccodeBinName));
            fs.closeSync(fs.openSync(codeTempFile, 'w'));
            const [codeFound] = searchCode(codeTempPath, ccodeBinName);
            codeFound.should.be.true;
        });
    });
    describe('getCodeFromPathEnv', () => {
        it('finds code in path when env.PATH is null', () => {
            process.env.PATH = '';
            const [codeFound] = getCodeFromPathEnv();
            consoleLogger.redirectedConsole.warn[0].should.equal('Code not found, PATH is empty.');
            codeFound.should.be.false;
        });
        it('finds code in path when code script is in PATH', () => {
            const newCodeTempDir = path.join(tempdir, 'codenew');
            mkdirSync(newCodeTempDir);
            const newCodeTempFile = normalizeForWindows(path.join(newCodeTempDir, codeBinName));
            fs.closeSync(fs.openSync(newCodeTempFile, 'w'));
            process.env.PATH = `${newCodeTempDir}`;
            const [codeFound, codePath] = getCodeFromPathEnv();
            codeFound.should.be.true;
            if (isTravisOnAMac) codePath.should.endWith(newCodeTempFile); // travis adds /private to the base dir
            else codePath.should.equal(newCodeTempFile);
        });
        it('does not find code when not in path', () => {
            const newCodeTempDir = path.join(tempdir, 'codenew');
            mkdirSync(newCodeTempDir);
            process.env.PATH = `${newCodeTempDir}`;
            const [codeFound] = getCodeFromPathEnv();
            consoleLogger.redirectedConsole.warn[0].should.equal('Code not found.');
            codeFound.should.be.false;
        });
    });
    describe('findCode', () => {
        it('finds Code in path', () => {
            const cwdIntermediaryTempDir = path.join(tempdir, 'a', 'b', 'c');
            const codeTempDir = path.join(cwdIntermediaryTempDir, codeDirName);
            mkdirp(codeTempDir);
            const codeTempFile = normalizeForWindows(path.join(codeTempDir, ccodeBinName));
            fs.closeSync(fs.openSync(codeTempFile, 'w'));
            const cwdDir = path.join(cwdIntermediaryTempDir, 'd', 'e', 'f');
            mkdirp(cwdDir);
            process.chdir(cwdDir);
            const [codeFound, codePath] = findCode();
            codeFound.should.be.true;
            if (isTravisOnAMac) codePath.should.endWith(codeTempFile); // travis adds /private to the base dir
            else codePath.should.equal(codeTempFile);
        });
    });
    describe('create-custom-code', () => {
        it(`creates code dir in ${codeDirName}`, () => {
            const cwdIntermediaryTempDir = path.join(tempdir, 'createcodedir');
            mkdirp(cwdIntermediaryTempDir);
            createCodeDir(cwdIntermediaryTempDir);
            existsSync(path.resolve(cwdIntermediaryTempDir, codeDirName)).should.be.true;
        });
        it('does not creates code dir if target dir does not exist', () => {
            const cwdIntermediaryTempDir = path.join(tempdir, 'createcodedir');
            const [created] = createCodeDir(cwdIntermediaryTempDir);
            created.should.be.false;
        });
        it('creates code file', () => {
            const cwdIntermediaryTempDir = path.join(tempdir, 'createcodefile');
            mkdirp(cwdIntermediaryTempDir);
            createCustomCodeFile(cwdIntermediaryTempDir);
            const codeFile = normalizeForWindows(path.resolve(cwdIntermediaryTempDir, ccodeBinName));
            expect(existsSync(codeFile), `File ${codeFile} does not exist`).to.be.true;
        });
        it('creates custom code e2e', () => {
            const cwdIntermediaryTempDir = path.join(tempdir, 'createcodee2e');
            mkdirp(cwdIntermediaryTempDir);
            createCustomCode(cwdIntermediaryTempDir);
            const codeFile = normalizeForWindows(path.resolve(cwdIntermediaryTempDir, codeDirName, ccodeBinName));
            expect(existsSync(codeFile), `File ${codeFile} does not exist`).to.be.true;
        });
    });
});

describe('customcode that does not touch the fs', () => {
    describe('normalizeForWindows', () => {
        it('should normalize path to windows and linux', () => {
            const normalized = normalizeForWindows(__dirname);
            if (process.platform === 'win32') normalized.should.equal(`${__dirname}.cmd`);
            else normalized.should.equal(__dirname);
        });
    });
});
