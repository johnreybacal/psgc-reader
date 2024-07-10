export default class Logger {
    private isEnabled = false;

    public setEnabled(isEnabled: boolean) {
        this.isEnabled = isEnabled;
    }

    public info(...args) {
        if (this.isEnabled) console.info(new Date(), ...args);
    }

    public error(...args) {
        if (this.isEnabled) console.error(new Date(), ...args);
    }
}
