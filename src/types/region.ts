import City from "./city";
import Municipality from "./municipality";
import Province from "./province";
import { Location } from "./psgc";

export default class Region extends Location {
    provinces: Province[] = [];
    cities: City[] = [];
    municipalities: Municipality[] = [];
}
