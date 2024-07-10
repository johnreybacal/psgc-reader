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

export interface Region extends BaseLocation {}

/**
 * Province
 * subTypes: Province / HUC
 */
export interface Province extends BaseLocation {
    regionCode: string;
    subType: string;
}
/**
 * City
 * subTypes: City / Municipality / Sub-Municipality
 */
export interface City extends Province {
    provinceCode: string;
}

export interface Barangay extends Omit<City, "subType"> {
    municipalityCode: string;
}

export class Tables {
    public regions: Region[] = [];
    public provinces: Province[] = [];
    public cities: City[] = [];
    public barangays: Barangay[] = [];
}
