import Barangay from "./barangay";
import City from "./city";
import { Location } from "./psgc";

/**
 * SubMunicipality
 */
export default class SubMunicipality extends Location {
    city: City;
    barangays: Barangay[] = [];
}
