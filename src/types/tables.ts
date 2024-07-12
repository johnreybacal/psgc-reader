import Barangay from "./barangay";
import City from "./city";
import Municipality from "./municipality";
import Province from "./province";
import Region from "./region";
import SubMunicipality from "./subMunicipality";

export class Tables {
    public regions: Region[] = [];
    public provinces: Province[] = [];
    public cities: City[] = [];
    public municipalities: Municipality[] = [];
    public subMunicipalities: SubMunicipality[] = [];
    public barangays: Barangay[] = [];
}
