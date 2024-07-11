import readXlsxFile from "read-excel-file/node";
import Logger from "./logger";
import Barangay from "./types/barangay";
import City from "./types/city";
import Province from "./types/province";
import { FilteredPSGC, PSGCRecord } from "./types/psgc";
import Region from "./types/region";
import { Tables } from "./types/tables";

const DEFAULT_SHEET_NAME = "PSGC";
const schema = {
    "10-digit PSGC": {
        prop: "code",
        type: String,
    },
    Name: {
        prop: "name",
        type: String,
    },
    "Correspondence Code": {
        prop: "oldCode",
        type: String,
    },
    "Geographic Level": {
        prop: "geoLevel",
        type: String,
    },
    "Old names": {
        prop: "oldName",
        type: String,
    },
    "City Class": {
        prop: "class",
        type: String,
    },
    "Income\nClassification": {
        prop: "incomeClass",
        type: String,
    },
    "Urban / Rural\n(based on 2020 CPH)": {
        prop: "urbanRural",
        type: String,
    },
    "2020 Population": {
        prop: "population",
        type: Number,
    },
    "": {
        prop: "remarks",
        type: String,
    },
    Status: {
        prop: "status",
        type: String,
    },
};

const REGION = "Reg";
const PROVINCE = "Prov";
const CITY = "City";
const MUNICIPALITY = "Mun";
const SUB_MUNICIPALITY = "SubMun";
const BARANGAY = "Bgy";

export default class PSGC {
    static #instance: PSGC;

    #logger: Logger;

    #locations: PSGCRecord[] = [];
    #filteredPSGC: FilteredPSGC = new FilteredPSGC();
    #tables: Tables = new Tables();

    private constructor() {}

    public static get instance(): PSGC {
        if (!PSGC.#instance) {
            PSGC.#instance = new PSGC();
            PSGC.#instance.#logger = new Logger();
        }

        return PSGC.#instance;
    }

    public get locations() {
        return this.#locations;
    }
    public get filteredPSGC() {
        return this.#filteredPSGC;
    }
    public get tables() {
        return this.#tables;
    }

    public enableLogger() {
        this.#logger.setEnabled(true);
        return this;
    }

    public disableLogger() {
        this.#logger.setEnabled(false);
        return this;
    }

    public async readExcel(filePath: string, sheet = DEFAULT_SHEET_NAME) {
        try {
            this.#logger.info(`Start reading: ${filePath}`);

            const workSheet = await readXlsxFile(filePath, {
                sheet,
                schema,
            });

            this.#locations = workSheet.rows as unknown[] as PSGCRecord[];

            this.#logger.info("Read complete");

            return this;
        } catch (error) {
            this.#logger.error(error);
        }
    }

    public filterGeoLevel() {
        this.#logger.info("Start filtering by geographic level");

        const psgc = this.#filteredPSGC;
        const tables = this.#tables;
        this.#locations.forEach((location) => {
            switch (location.geoLevel) {
                case REGION:
                    this.addRegion(location);
                    psgc.regions.push(location);
                    break;
                case PROVINCE:
                    this.addProvince(location);
                    psgc.provinces.push(location);
                    break;
                case CITY:
                    this.addCity(location);
                    psgc.cities.push(location);
                    break;
                case MUNICIPALITY:
                    this.addCity(location);
                    psgc.municipalities.push(location);
                    break;
                case SUB_MUNICIPALITY:
                    this.addCity(location);
                    psgc.subMunicipalities.push(location);
                    break;
                case BARANGAY:
                    this.addBarangay(location);
                    psgc.barangays.push(location);
                    break;
                default:
                    // Some records does not have geo level
                    this.#logger.info("Missing geographic level:", location);

                    // We'll determine the geo level using it's code
                    location.code = String(location.code);

                    // Is region level
                    if (location.code.endsWith("00000000")) {
                        psgc.regions.push(location);
                    }
                    // Is province level
                    else if (location.code.endsWith("00000")) {
                        psgc.provinces.push(location);
                    }
                    // Is city level
                    else if (location.code.endsWith("000")) {
                        psgc.cities.push(location);
                    }
                    // Is barangay level
                    else {
                        psgc.barangays.push(location);
                    }
                    break;
            }
        });

        this.#logger.info("Filter completed");
        return this;
    }

    public associateLocations() {
        const tables = this.tables;

        const getRegion = (code: string) => {
            return tables.regions.filter((region) =>
                region.code.startsWith(code.substring(0, 2))
            )[0];
        };
        const getProvince = (code: string, city: City) => {
            if (!(city.type === "City" && city.cityClass === "HUC")) {
                return tables.provinces.filter((province) =>
                    province.code.startsWith(code.substring(0, 5))
                )[0];
            } else {
                return undefined;
            }
        };
        tables.regions.forEach((region) => {
            region.provinces = tables.provinces.filter(
                (province) =>
                    province.code.substring(0, 2) ===
                    region.code.substring(0, 2)
            );
        });
        tables.provinces.forEach((province) => {
            province.region = getRegion(province.code);

            province.cities = tables.cities.filter(
                (city) =>
                    city.code.substring(0, 5) === province.code.substring(0, 5)
            );
        });
        tables.cities.forEach((city) => {
            city.region = getRegion(city.code);

            city.province = getProvince(city.code, city);

            city.barangays = tables.barangays.filter(
                (barangay) =>
                    barangay.code.substring(0, 7) === city.code.substring(0, 7)
            );
        });
        tables.barangays.forEach((barangay) => {
            barangay.region = getRegion(barangay.code);
            barangay.city = tables.cities.filter((city) =>
                city.barangays.includes(barangay)
            )[0];

            barangay.province = getProvince(barangay.code, barangay.city);
        });
    }

    private addRegion(location: PSGCRecord) {
        const region = new Region();
        region.code = location.code;
        region.name = location.name;

        this.tables.regions.push(region);
    }
    private addProvince(location: PSGCRecord) {
        const province = new Province();
        province.code = location.code;
        province.name = location.name;

        this.tables.provinces.push(province);
    }
    private addCity(location: PSGCRecord) {
        const city = new City();
        city.code = location.code;
        city.name = location.name;

        if (location.geoLevel) city.type = location.geoLevel;
        if (location.class) city.cityClass = location.class;

        this.tables.cities.push(city);
    }
    private addBarangay(location: PSGCRecord) {
        const barangay = new Barangay();
        barangay.name = location.name;
        barangay.code = location.code;

        this.tables.barangays.push(barangay);
    }

    public reset() {
        this.#locations = [];
        this.#filteredPSGC = new FilteredPSGC();
        this.#tables = new Tables();
    }
}
