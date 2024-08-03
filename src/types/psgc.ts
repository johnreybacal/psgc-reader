import Barangay from "./barangay";
import City from "./city";
import Municipality from "./municipality";
import Province from "./province";
import Region from "./region";
import SubMunicipality from "./subMunicipality";

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

export class Location {
    code: string;
    name: string;
    oldCode: string;
    population: number;
}

export interface PsgcReaderResult {
    regions: Region[];
    provinces: Province[];
    cities: City[];
    municipalities: Municipality[];
    subMunicipalities: SubMunicipality[];
    barangays: Barangay[];
}
