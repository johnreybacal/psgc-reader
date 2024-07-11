import Barangay from "./barangay";
import Province from "./province";
import Region from "./region";

/**
 * City
 * subTypes: City / Municipality / Sub-Municipality
 */
export default class City {
    code: string;
    name: string;
    type: string;
    cityClass: string;
    region: Region;
    province: Province;
    barangays: Barangay[] = [];
}
