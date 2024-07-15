import Barangay from "./barangay";
import Province from "./province";
import { Location } from "./psgc";
import Region from "./region";
import SubMunicipality from "./subMunicipality";

/**
 * City
 */
export default class City extends Location {
    class: string;
    incomeClassification: string;
    region?: Region;
    province?: Province;
    subMunicipalities?: SubMunicipality[];
    barangays: Barangay[] = [];
}
