export default class Region {
    #code: string;
    #name: string;

    public set code(value: string) {
        this.#code = value;
    }
    public get code() {
        return this.#code;
    }
    public set name(value: string) {
        this.#name = value;
    }
    public get name() {
        return this.#name;
    }
}
