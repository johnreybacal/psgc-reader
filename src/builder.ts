import Barangay from "./types/barangay";
import City from "./types/city";
import Municipality from "./types/municipality";
import Province from "./types/province";
import { Location, PsgcRecord } from "./types/psgc";
import Region from "./types/region";
import SubMunicipality from "./types/subMunicipality";

export interface LocationBuilder {
    buildRegion(record: PsgcRecord): Region;
    buildProvince(record: PsgcRecord): Province;
    buildCity(record: PsgcRecord): City;
    buildMunicipality(record: PsgcRecord): Municipality;
    buildSubMunicipality(record: PsgcRecord): SubMunicipality;
    buildBarangay(record: PsgcRecord): Barangay;
}

export class BasicBuilder implements LocationBuilder {
    buildRegion(record: PsgcRecord): Region {
        const location = new Region();
        this.fill(location, record);

        return location;
    }
    buildProvince(record: PsgcRecord): Province {
        const location = new Province();
        this.fill(location, record);

        return location;
    }
    buildCity(record: PsgcRecord): City {
        const location = new City();
        this.fill(location, record);

        return location;
    }
    buildMunicipality(record: PsgcRecord): Municipality {
        const location = new Municipality();
        this.fill(location, record);

        return location;
    }
    buildSubMunicipality(record: PsgcRecord): SubMunicipality {
        const location = new SubMunicipality();
        this.fill(location, record);

        return location;
    }
    buildBarangay(record: PsgcRecord): Barangay {
        const location = new Barangay();
        this.fill(location, record);

        return location;
    }
    private fill<T extends Location>(location: T, record: PsgcRecord) {
        location.code = record.code;
        location.name = record.name;

        return location;
    }
}

export class CompleteBuilder implements LocationBuilder {
    buildRegion(record: PsgcRecord): Region {
        const location = new Region();
        this.fill(location, record);

        return location;
    }
    buildProvince(record: PsgcRecord): Province {
        const location = new Province();
        this.fill(location, record);

        location.incomeClassification = record.incomeClassification;

        return location;
    }
    buildCity(record: PsgcRecord): City {
        const location = new City();
        this.fill(location, record);

        location.class = record.class;
        location.incomeClassification = record.incomeClassification;

        return location;
    }
    buildMunicipality(record: PsgcRecord): Municipality {
        const location = new Municipality();
        this.fill(location, record);

        location.incomeClassification = record.incomeClassification;

        return location;
    }
    buildSubMunicipality(record: PsgcRecord): SubMunicipality {
        const location = new SubMunicipality();
        this.fill(location, record);

        return location;
    }
    buildBarangay(record: PsgcRecord): Barangay {
        const location = new Barangay();
        this.fill(location, record);

        location.urbanRuralClassification = record.urbanRuralClassification;

        return location;
    }
    private fill<T extends Location>(location: T, record: PsgcRecord) {
        location.code = record.code;
        location.name = record.name;
        location.oldCode = record.oldCode;
        location.population = record.population;

        return location;
    }
}
