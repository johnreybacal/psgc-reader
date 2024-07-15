import City from "./city";
import Municipality from "./municipality";
import { Location } from "./psgc";
import SubMunicipality from "./subMunicipality";

export default class Barangay extends Location {
    urbanRuralClassification: string;
    parent: City | Municipality | SubMunicipality;
}
