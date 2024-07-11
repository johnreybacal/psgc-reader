import City from "./city";
import Region from "./region";

/**
 * Province
 */
export default class Province {
    code: string;
    name: string;
    region: Region;
    cities: City[] = [];
}
