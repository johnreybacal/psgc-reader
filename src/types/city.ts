import Province from "./province";

/**
 * City
 * subTypes: City / Municipality / Sub-Municipality
 */
export default class City extends Province {
    #provinceCode: string;
    #type: string;
    #cityClass: string = "";

    public setJurisdictionCode() {
        super.setJurisdictionCode();

        // HUC city does not have a province
        if (!(this.#type === "City" && this.#cityClass === "HUC")) {
            this.#provinceCode = `${this.code.toString().substring(0, 5)}00000`;
        }
    }

    public get provinceCode() {
        return this.#provinceCode;
    }
    public set type(value: string) {
        this.#type = value;
    }
    public get type() {
        return this.#type;
    }
    public set cityClass(value: string) {
        this.#cityClass = value;
    }
    public get cityClass() {
        return this.#cityClass;
    }
}
