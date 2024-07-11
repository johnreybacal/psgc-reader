export default class Region {
    private _code: string;
    private _name: string;

    public set code(value: string) {
        this._code = value;
    }
    public get code() {
        return this._code;
    }
    public set name(value: string) {
        this._name = value;
    }
    public get name() {
        return this._name;
    }
}
