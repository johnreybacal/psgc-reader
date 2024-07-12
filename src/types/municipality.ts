import Barangay from "./barangay";
import Province from "./province";
import { Location } from "./psgc";
import Region from "./region";

/**
 * Municipality
 */
export default class Municipality extends Location {
    region?: Region;
    province: Province;
    barangays: Barangay[] = [];
}
