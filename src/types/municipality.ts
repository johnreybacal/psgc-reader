import Barangay from "./barangay";
import Province from "./province";
import { Location } from "./psgc";
import Region from "./region";

/**
 * Municipality
 */
export default class Municipality extends Location {
    incomeClassification: string;
    region?: Region;
    province: Province;
    barangays: Barangay[] = [];
}
