export interface PSGCRecord {
    code: string;
    name: string;
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
