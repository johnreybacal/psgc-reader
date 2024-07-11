import Barangay from "./barangay";
import Province from "./province";

/**
 * City
 * subTypes: City / Municipality / Sub-Municipality
 */
export default class City {
    code: string;
    name: string;
    type: string;
    cityClass: string;
    province: Province;
    barangays: Barangay[] = [];
}
