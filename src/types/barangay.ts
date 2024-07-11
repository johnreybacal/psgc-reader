import City from "./city";
import Province from "./province";
import Region from "./region";

export default class Barangay {
    code: string;
    name: string;
    region: Region;
    province: Province;
    city: City;
}
