import City from "./city";
import Municipality from "./municipality";
import { Location } from "./psgc";
import Region from "./region";

/**
 * Province
 */
export default class Province extends Location {
    incomeClassification: string;
    region: Region;
    cities: City[] = [];
    municipalities: Municipality[] = [];
}
