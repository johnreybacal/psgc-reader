export interface PsgcRecord {
    code: string;
    name: string;
    geoLevel: string;
    class: string;
    oldCode: string;
    oldName: string;
    incomeClassification: string;
    urbanRuralClassification: string;
    population: number;
    status: string;
}

export class FilteredPsgc {
    public regions: PsgcRecord[] = [];
    public provinces: PsgcRecord[] = [];
    public cities: PsgcRecord[] = [];
    public municipalities: PsgcRecord[] = [];
    public subMunicipalities: PsgcRecord[] = [];
    public barangays: PsgcRecord[] = [];
}
export class Location {
    code: string;
    name: string;
    oldCode: string;
    population: number;
}
