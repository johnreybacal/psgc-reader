export interface BaseLocation {
    code: string;
    name: string;
}

export interface PSGCRecord extends BaseLocation {
    geoLevel: string;
    class: string;
    oldCode: string;
    oldName: string;
    incomeClass: string;
    urbanRural: string;
    population: number;
    status: string;
}

export class FilteredPSGC {
    public regions: PSGCRecord[] = [];
    public provinces: PSGCRecord[] = [];
    public cities: PSGCRecord[] = [];
    public municipalities: PSGCRecord[] = [];
    public subMunicipalities: PSGCRecord[] = [];
    public barangays: PSGCRecord[] = [];
}

export class Region {
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

/**
 * Province
 * subTypes: Province / HUC
 */
export class Province extends Region {
    private _regionCode: string;

    public setJurisdictionCode() {
        this._regionCode = `${this.code.toString().substring(0, 2)}00000000`;
    }

    public get regionCode() {
        return this._regionCode;
    }
}
/**
 * City
 * subTypes: City / Municipality / Sub-Municipality
 */
export class City extends Province {
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

export class Barangay extends City {
    _cityCode: string;

    public setJurisdictionCode() {
        super.setJurisdictionCode();
        this._cityCode = `${this.code.toString().substring(0, 2)}00000000`;
    }

    public get cityCode() {
        return this._cityCode;
    }
}

export class Tables {
    public regions: Region[] = [];
    public provinces: Province[] = [];
    public cities: City[] = [];
    public barangays: Barangay[] = [];
}
