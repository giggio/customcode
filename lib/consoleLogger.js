class ConsoleLogger {
    constructor() {
        this.redirectedConsole = null;
    }
    warn(msg) {
        if (this.redirectedConsole) this.redirectedConsole.warn.push(msg);
        else console.warn(...arguments);
    }
    redirectConsole(redirect = true) {
        if (redirect) {
            this.redirectedConsole = {
                warn: []
            };
        } else {
            this.redirectedConsole = null;
        }
    }
}

module.exports = { consoleLogger: new ConsoleLogger() };
