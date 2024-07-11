import Region from "./region";

/**
 * Province
 * subTypes: Province / HUC
 */
export default class Province extends Region {
    #regionCode: string;

    public setJurisdictionCode() {
        this.#regionCode = `${this.code.toString().substring(0, 2)}00000000`;
    }

    public get regionCode() {
        return this.#regionCode;
    }
}
