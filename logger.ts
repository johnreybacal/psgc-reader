export default class Logger {
    private isEnabled = false;

    public setEnabled(isEnabled: boolean) {
        this.isEnabled = isEnabled;
    }

    info(...args) {
        if (this.isEnabled) console.info(new Date(), ...args);
    }

    error(...args) {
        if (this.isEnabled) console.error(new Date(), ...args);
    }
}
