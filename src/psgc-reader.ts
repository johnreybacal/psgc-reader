import readXlsxFile from "read-excel-file/node";
import Logger from "./logger";
import Barangay from "./types/barangay";
import City from "./types/city";
import Municipality from "./types/municipality";
import Province from "./types/province";
import { FilteredPsgc, Location, PsgcRecord } from "./types/psgc";
import Region from "./types/region";
import SubMunicipality from "./types/subMunicipality";

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

export default class PsgcReader {
    static #instance: PsgcReader;

    #logger: Logger;

    #locations: PsgcRecord[] = [];
    #filteredPSGC: FilteredPsgc = new FilteredPsgc();
    #regions: Region[] = [];
    #provinces: Province[] = [];
    #cities: City[] = [];
    #municipalities: Municipality[] = [];
    #subMunicipalities: SubMunicipality[] = [];
    #barangays: Barangay[] = [];

    private constructor() {}

    public static get instance(): PsgcReader {
        if (!PsgcReader.#instance) {
            PsgcReader.#instance = new PsgcReader();
            PsgcReader.#instance.#logger = new Logger();
        }

        return PsgcReader.#instance;
    }

    public get locations() {
        return this.#locations;
    }
    public get filteredPSGC() {
        return this.#filteredPSGC;
    }
    public get regions() {
        return this.#regions;
    }
    public get provinces() {
        return this.#provinces;
    }
    public get cities() {
        return this.#cities;
    }
    public get municipalities() {
        return this.#municipalities;
    }
    public get subMunicipalities() {
        return this.#subMunicipalities;
    }
    public get barangays() {
        return this.#barangays;
    }

    /**
     * Enables the logger
     */
    public enableLogger() {
        this.#logger.setEnabled(true);
        return this;
    }

    /**
     * Disables the logger
     */
    public disableLogger() {
        this.#logger.setEnabled(false);
        return this;
    }

    /**
     * Read PSA's PSGC publication datafile
     * - Records will be stored in `locations`
     * - Get the publication datafile here: https://psa.gov.ph/classification/psgc
     * @param filePath path to PSGC publication datafile
     * @param sheet defaults to PSGC
     */
    public async read(filePath: string, sheet = DEFAULT_SHEET_NAME) {
        try {
            this.#logger.info(`Start reading: ${filePath}`);

            const workSheet = await readXlsxFile(filePath, {
                sheet,
                schema,
            });

            this.#locations = workSheet.rows as unknown[] as PsgcRecord[];

            this.#logger.info("Read complete");
        } catch (error) {
            this.#logger.error(error);
        }
    }

    /**
     * Filters the `locations` into:
     * - `filteredPSGC`: filtered `locations`
     * - Lists that can be associated:
     *   - `regions`
     *   - `provinces`
     *   - `cities`
     *   - `municipalities`
     *   - `subMunicipalities`
     *   - `barangays`
     * @returns {PsgcReader}
     */
    public filter() {
        this.#logger.info("Start filtering by geographic level");

        const psgc = this.#filteredPSGC;
        this.#locations.forEach((location) => {
            switch (location.geoLevel) {
                case REGION:
                    this.regions.push(this.convertPsgc(location) as Region);
                    psgc.regions.push(location);
                    break;
                case PROVINCE:
                    this.provinces.push(this.convertPsgc(location) as Province);
                    psgc.provinces.push(location);
                    break;
                case CITY:
                    this.cities.push({
                        code: location.code,
                        name: location.name,
                        class: location.class,
                    } as City);
                    psgc.cities.push(location);
                    break;
                case MUNICIPALITY:
                    this.municipalities.push(
                        this.convertPsgc(location) as Municipality
                    );
                    psgc.municipalities.push(location);
                    break;
                case SUB_MUNICIPALITY:
                    this.subMunicipalities.push(
                        this.convertPsgc(location) as SubMunicipality
                    );
                    psgc.subMunicipalities.push(location);
                    break;
                case BARANGAY:
                    this.barangays.push(this.convertPsgc(location) as Barangay);
                    psgc.barangays.push(location);
                    break;
                default:
                    // Some records does not have geo level
                    this.#logger.info("Missing geographic level:", location);

                    // We'll determine the geo level using it's code
                    location.code = String(location.code);

                    // Is region level
                    if (location.code.endsWith("00000000")) {
                        this.regions.push(this.convertPsgc(location) as Region);
                        psgc.regions.push(location);
                    }
                    // Is province level
                    else if (location.code.endsWith("00000")) {
                        this.provinces.push(
                            this.convertPsgc(location) as Province
                        );
                        psgc.provinces.push(location);
                    }
                    // Is city level
                    else if (location.code.endsWith("000")) {
                        this.cities.push({
                            code: location.code,
                            name: location.name,
                            class: location.class,
                        } as City);
                        psgc.cities.push(location);
                    }
                    // Is barangay level
                    else {
                        this.barangays.push(
                            this.convertPsgc(location) as Barangay
                        );
                        psgc.barangays.push(location);
                    }
                    break;
            }
        });

        this.#logger.info("Filter completed");
        this.#logger.info("\tRegions:", this.regions.length);
        this.#logger.info("\tProvinces:", this.provinces.length);
        this.#logger.info("\tCities:", this.cities.length);
        this.#logger.info("\tMunicipalities:", this.municipalities.length);
        this.#logger.info(
            "\tSubMunicipalities:",
            this.subMunicipalities.length
        );
        this.#logger.info("\tBarangays:", this.barangays.length);
        return this;
    }

    /**
     * Associates `regions`, `provinces`, `cities`, `municipalities`, `subMunicipalities`, and `barangays`
     * @returns {PsgcReader}
     */
    public associate() {
        this.#logger.info("Start location association");
        const ncrCode = "13";
        const manilaCityCode = `${ncrCode}806`;

        const getRegion = (code: string) => {
            return this.regions.filter((region) =>
                region.code.startsWith(code.substring(0, 2))
            )[0];
        };
        const getProvince = (code: string) => {
            return this.provinces.filter((province) =>
                province.code.startsWith(code.substring(0, 5))
            )[0];
        };

        const nonNcr = this.regions.filter(
            (region) => !region.code.startsWith(ncrCode)
        );
        nonNcr.forEach((region) => {
            region.provinces = this.provinces.filter(
                (province) =>
                    province.code.substring(0, 2) ===
                    region.code.substring(0, 2)
            );
        });

        const ncr = this.regions.filter((region) =>
            region.code.startsWith(ncrCode)
        )[0];
        ncr.cities = [];
        ncr.municipalities = [];

        this.#logger.info("\tRegions associated");

        this.provinces.forEach((province) => {
            province.region = getRegion(province.code);

            province.cities = this.cities.filter(
                (city) =>
                    city.code.substring(0, 5) === province.code.substring(0, 5)
            );
            province.municipalities = this.municipalities.filter(
                (municipality) =>
                    municipality.code.substring(0, 5) ===
                    province.code.substring(0, 5)
            );
        });

        this.#logger.info("\tProvinces associated");

        this.cities.forEach((city) => {
            city.region = getRegion(city.code);

            city.province = getProvince(city.code);

            if (city.code.startsWith(ncrCode)) {
                // NCR
                ncr.cities.push(city);
                city.region = ncr;

                if (city.code.startsWith(manilaCityCode)) {
                    city.subMunicipalities = [...this.subMunicipalities];
                    city.barangays = [];
                    // Skip barangay if manila
                    return;
                }
            }
            city.barangays = this.barangays.filter(
                (barangay) =>
                    barangay.code.substring(0, 7) === city.code.substring(0, 7)
            );
        });

        this.#logger.info("\tCities associated");

        this.municipalities.forEach((municipality) => {
            municipality.province = getProvince(municipality.code);

            municipality.barangays = this.barangays.filter(
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

        this.subMunicipalities.forEach((subMunicipality) => {
            subMunicipality.city = this.cities.filter((city) =>
                city.code.startsWith("13806")
            )[0];

            subMunicipality.barangays = this.barangays.filter(
                (barangay) =>
                    barangay.code.substring(0, 7) ===
                    subMunicipality.code.substring(0, 7)
            );
        });

        this.#logger.info("\tSubMunicipalities associated");

        this.barangays.forEach((barangay) => {
            const parents = [
                ...this.cities.filter((city) =>
                    city.barangays.includes(barangay)
                ),
                ...this.municipalities.filter((municipality) =>
                    municipality.barangays.includes(barangay)
                ),
                ...this.subMunicipalities.filter((subMunicipality) =>
                    subMunicipality.barangays.includes(barangay)
                ),
            ];

            barangay.parent = parents[0];
        });

        this.#logger.info("\tBarangays associated");
        this.#logger.info("Location association completed");

        return this;
    }

    private convertPsgc(psgc: PsgcRecord) {
        const location = new Location();
        location.code = psgc.code;
        location.name = psgc.name;

        return location;
    }

    public reset() {
        this.#locations = [];
        this.#filteredPSGC = new FilteredPsgc();
        this.#regions = [];
        this.#provinces = [];
        this.#cities = [];
        this.#municipalities = [];
        this.#subMunicipalities = [];
        this.#barangays = [];
    }
}
