import Province from "./province";

/**
 * City
 * subTypes: City / Municipality / Sub-Municipality
 */
export default class City extends Province {
    private _provinceCode: string;
    private _type: string;
    private _cityClass: string = "";

    public setJurisdictionCode() {
        super.setJurisdictionCode();

        // HUC city does not have a province
        if (!(this._type === "City" && this._cityClass === "HUC")) {
            this._provinceCode = `${this.code.toString().substring(0, 5)}00000`;
        }
    }

    public get provinceCode() {
        return this._provinceCode;
    }
    public set type(value: string) {
        this._type = value;
    }
    public get type() {
        return this._type;
    }
    public set cityClass(value: string) {
        this._cityClass = value;
    }
    public get cityClass() {
        return this._cityClass;
    }
}
