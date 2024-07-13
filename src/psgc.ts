import readXlsxFile from "read-excel-file/node";
import Logger from "./logger";
import Barangay from "./types/barangay";
import City from "./types/city";
import Municipality from "./types/municipality";
import Province from "./types/province";
import { FilteredPSGC, Location, PSGCRecord } from "./types/psgc";
import Region from "./types/region";
import SubMunicipality from "./types/subMunicipality";
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
                    tables.regions.push(this.convertPsgc(location) as Region);
                    psgc.regions.push(location);
                    break;
                case PROVINCE:
                    tables.provinces.push(
                        this.convertPsgc(location) as Province
                    );
                    psgc.provinces.push(location);
                    break;
                case CITY:
                    tables.cities.push({
                        code: location.code,
                        name: location.name,
                        class: location.class,
                    } as City);
                    psgc.cities.push(location);
                    break;
                case MUNICIPALITY:
                    tables.municipalities.push(
                        this.convertPsgc(location) as Municipality
                    );
                    psgc.municipalities.push(location);
                    break;
                case SUB_MUNICIPALITY:
                    tables.subMunicipalities.push(
                        this.convertPsgc(location) as SubMunicipality
                    );
                    psgc.subMunicipalities.push(location);
                    break;
                case BARANGAY:
                    tables.barangays.push(
                        this.convertPsgc(location) as Barangay
                    );
                    psgc.barangays.push(location);
                    break;
                default:
                    // Some records does not have geo level
                    this.#logger.info("Missing geographic level:", location);

                    // We'll determine the geo level using it's code
                    location.code = String(location.code);

                    // Is region level
                    if (location.code.endsWith("00000000")) {
                        tables.regions.push(
                            this.convertPsgc(location) as Region
                        );
                        psgc.regions.push(location);
                    }
                    // Is province level
                    else if (location.code.endsWith("00000")) {
                        tables.provinces.push(
                            this.convertPsgc(location) as Province
                        );
                        psgc.provinces.push(location);
                    }
                    // Is city level
                    else if (location.code.endsWith("000")) {
                        tables.cities.push({
                            code: location.code,
                            name: location.name,
                            class: location.class,
                        } as City);
                        psgc.cities.push(location);
                    }
                    // Is barangay level
                    else {
                        tables.barangays.push(
                            this.convertPsgc(location) as Barangay
                        );
                        psgc.barangays.push(location);
                    }
                    break;
            }
        });

        this.#logger.info("Filter completed");
        this.#logger.info("\tRegions:", tables.regions.length);
        this.#logger.info("\tProvinces:", tables.provinces.length);
        this.#logger.info("\tCities:", tables.cities.length);
        this.#logger.info("\tMunicipalities:", tables.municipalities.length);
        this.#logger.info(
            "\tSubMunicipalities:",
            tables.subMunicipalities.length
        );
        this.#logger.info("\tBarangays:", tables.barangays.length);
        return this;
    }

    public associateLocations() {
        this.#logger.info("Start location association");
        const tables = this.tables;
        const ncrCode = "13";
        const manilaCityCode = `${ncrCode}806`;

        const getRegion = (code: string) => {
            return tables.regions.filter((region) =>
                region.code.startsWith(code.substring(0, 2))
            )[0];
        };
        const getProvince = (code: string) => {
            return tables.provinces.filter((province) =>
                province.code.startsWith(code.substring(0, 5))
            )[0];
        };

        const nonNcr = tables.regions.filter(
            (region) => !region.code.startsWith(ncrCode)
        );
        nonNcr.forEach((region) => {
            region.provinces = tables.provinces.filter(
                (province) =>
                    province.code.substring(0, 2) ===
                    region.code.substring(0, 2)
            );
        });

        const ncr = tables.regions.filter((region) =>
            region.code.startsWith(ncrCode)
        )[0];
        ncr.cities = [];
        ncr.municipalities = [];

        this.#logger.info("\tRegions associated");

        tables.provinces.forEach((province) => {
            province.region = getRegion(province.code);

            province.cities = tables.cities.filter(
                (city) =>
                    city.code.substring(0, 5) === province.code.substring(0, 5)
            );
            province.municipalities = tables.municipalities.filter(
                (municipality) =>
                    municipality.code.substring(0, 5) ===
                    province.code.substring(0, 5)
            );
        });

        this.#logger.info("\tProvinces associated");

        tables.cities.forEach((city) => {
            city.region = getRegion(city.code);

            city.province = getProvince(city.code);

            if (city.code.startsWith(ncrCode)) {
                // NCR
                ncr.cities.push(city);
                city.region = ncr;

                if (city.code.startsWith(manilaCityCode)) {
                    city.subMunicipalities = [...tables.subMunicipalities];
                    city.barangays = [];
                    // Skip barangay if manila
                    return;
                }
            }
            city.barangays = tables.barangays.filter(
                (barangay) =>
                    barangay.code.substring(0, 7) === city.code.substring(0, 7)
            );
        });

        this.#logger.info("\tCities associated");

        tables.municipalities.forEach((municipality) => {
            municipality.province = getProvince(municipality.code);

            municipality.barangays = tables.barangays.filter(
                (barangay) =>
                    barangay.code.substring(0, 7) ===
                    municipality.code.substring(0, 7)
            );

            if (municipality.code.startsWith(ncrCode)) {
                ncr.municipalities.push(municipality);
                municipality.region = ncr;
            }
        });

        this.#logger.info("\tMunicipalities associated");

        tables.subMunicipalities.forEach((subMunicipality) => {
            subMunicipality.city = tables.cities.filter((city) =>
                city.code.startsWith("13806")
            )[0];

            subMunicipality.barangays = tables.barangays.filter(
                (barangay) =>
                    barangay.code.substring(0, 7) ===
                    subMunicipality.code.substring(0, 7)
            );
        });

        this.#logger.info("\tSubMunicipalities associated");

        tables.barangays.forEach((barangay) => {
            const parents = [
                ...tables.cities.filter((city) =>
                    city.barangays.includes(barangay)
                ),
                ...tables.municipalities.filter((municipality) =>
                    municipality.barangays.includes(barangay)
                ),
                ...tables.subMunicipalities.filter((subMunicipality) =>
                    subMunicipality.barangays.includes(barangay)
                ),
            ];

            barangay.parent = parents[0];
        });

        this.#logger.info("\tBarangays associated");
        this.#logger.info("Location association completed");

        return this;
    }

    private convertPsgc(psgc: PSGCRecord) {
        const location = new Location();
        location.code = psgc.code;
        location.name = psgc.name;

        return location;
    }

    public reset() {
        this.#locations = [];
        this.#filteredPSGC = new FilteredPSGC();
        this.#tables = new Tables();
    }
}
