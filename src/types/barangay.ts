import City from "./city";

export default class Barangay extends City {
    #cityCode: string;

    public setJurisdictionCode() {
        super.setJurisdictionCode();
        this.#cityCode = `${this.code.toString().substring(0, 2)}00000000`;
    }

    public get cityCode() {
        return this.#cityCode;
    }
}
