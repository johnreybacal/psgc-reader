import readXlsxFile from "read-excel-file/node";
import { BasicBuilder, CompleteBuilder, LocationBuilder } from "./builder";
import Logger from "./logger";
import Barangay from "./types/barangay";
import City from "./types/city";
import Municipality from "./types/municipality";
import Province from "./types/province";
import { PsgcRecord } from "./types/psgc";
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
        prop: "incomeClassification",
        type: String,
    },
    "Urban / Rural\n(based on 2020 CPH)": {
        prop: "urbanRuralClassification",
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
    #builder: LocationBuilder;

    #locations: PsgcRecord[] = [];
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

    public setBuilder(builder: LocationBuilder) {
        this.#builder = builder;

        return this;
    }

    /**
     * Read PSA's PSGC publication datafile
     * - Records will be stored in `locations`
     * - Get the publication datafile here: https://psa.gov.ph/classification/psgc
     * @param filePath path to PSGC publication datafile
     * @param sheet defaults to PSGC
     */
    public async readPublicationFile(
        filePath: string,
        sheet = DEFAULT_SHEET_NAME
    ) {
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

        if (!this.#builder) {
            this.#builder = new CompleteBuilder();
        }

        const builder = this.#builder;

        this.#locations.forEach((location) => {
            switch (location.geoLevel) {
                case REGION:
                    this.regions.push(builder.buildRegion(location));
                    break;
                case PROVINCE:
                    this.provinces.push(builder.buildProvince(location));
                    break;
                case CITY:
                    this.cities.push(builder.buildCity(location));
                    break;
                case MUNICIPALITY:
                    this.municipalities.push(
                        builder.buildMunicipality(location)
                    );
                    break;
                case SUB_MUNICIPALITY:
                    this.subMunicipalities.push(
                        builder.buildSubMunicipality(location)
                    );
                    break;
                case BARANGAY:
                    this.barangays.push(builder.buildBarangay(location));
                    break;
                default:
                    // Some records does not have geo level
                    this.#logger.info("Missing geographic level:", location);

                    // We'll determine the geo level using it's code
                    location.code = String(location.code);

                    // Is region level
                    if (location.code.endsWith("00000000")) {
                        this.regions.push(builder.buildRegion(location));
                    }
                    // Is province level
                    else if (location.code.endsWith("00000")) {
                        this.provinces.push(builder.buildProvince(location));
                    }
                    // Is city level
                    else if (location.code.endsWith("000")) {
                        this.cities.push(builder.buildCity(location));
                    }
                    // Is barangay level
                    else {
                        this.barangays.push(builder.buildBarangay(location));
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
        const compareCode = (
            { code: code1 }: { code: string },
            { code: code2 }: { code: string },
            index: number
        ) => {
            return code1.substring(0, index) === code2.substring(0, index);
        };

        // Associate provinces to non-NCR
        const nonNcr = this.regions.filter(
            (region) => !region.code.startsWith(ncrCode)
        );
        nonNcr.forEach((region) => {
            region.provinces = this.provinces.filter((province) =>
                compareCode(province, region, 2)
            );
        });

        // Associate cities and municipalities to NCR
        const ncr = this.regions.filter((region) =>
            region.code.startsWith(ncrCode)
        )[0];
        ncr.cities = this.cities.filter((city) =>
            city.code.startsWith(ncrCode)
        );
        ncr.municipalities = this.municipalities.filter((municipality) =>
            municipality.code.startsWith(ncrCode)
        );

        this.#logger.info("\tRegions associated");

        // Associate region, cities, and municipalities to province
        this.provinces.forEach((province) => {
            province.region = getRegion(province.code);

            province.cities = this.cities.filter((city) =>
                compareCode(city, province, 5)
            );
            province.municipalities = this.municipalities.filter(
                (municipality) => compareCode(municipality, province, 5)
            );
        });

        this.#logger.info("\tProvinces associated");

        // Associate region, provinces, subMunicipalities,  and barangays to city
        this.cities.forEach((city) => {
            city.province = getProvince(city.code);

            // If city has no province, get region
            // HUCs has no province, so we associate it to region
            // HUCs also have subMunicipalities, or at least those in NCR
            if (!city.province) {
                city.region = getRegion(city.code);

                city.subMunicipalities = this.subMunicipalities.filter(
                    (subMunicipality) => compareCode(city, subMunicipality, 5)
                );
            }

            city.barangays = this.barangays.filter((barangay) =>
                compareCode(barangay, city, 7)
            );
        });

        this.#logger.info("\tCities associated");

        this.municipalities.forEach((municipality) => {
            municipality.province = getProvince(municipality.code);

            // If municipality has no province, get region
            // It's probably Pateros in NCR
            if (!municipality.province) {
                municipality.region = getRegion(municipality.code);
            }

            municipality.barangays = this.barangays.filter((barangay) =>
                compareCode(barangay, municipality, 7)
            );
        });

        this.#logger.info("\tMunicipalities associated");

        this.subMunicipalities.forEach((subMunicipality) => {
            subMunicipality.city = this.cities.filter((city) =>
                compareCode(subMunicipality, city, 5)
            )[0];

            subMunicipality.barangays = this.barangays.filter((barangay) =>
                compareCode(barangay, subMunicipality, 7)
            );
        });

        this.#logger.info("\tSubMunicipalities associated");

        this.barangays.forEach((barangay) => {
            barangay.subMunicipality = this.subMunicipalities.filter(
                (subMunicipality) => compareCode(barangay, subMunicipality, 7)
            )[0];
            barangay.municipality = this.municipalities.filter((municipality) =>
                compareCode(barangay, municipality, 7)
            )[0];
            barangay.city = this.cities.filter((city) =>
                compareCode(barangay, city, 7)
            )[0];
        });

        this.#logger.info("\tBarangays associated");
        this.#logger.info("Location association completed");

        return this;
    }

    /**
     * Reads the publication file and return its records
     * @param filePath path to PSGC publication datafile
     * @param sheet defaults to PSGC
     */
    public async readRaw(
        filePath: string,
        sheet = DEFAULT_SHEET_NAME
    ): Promise<PsgcRecord[]> {
        await this.readPublicationFile(filePath, sheet);
        return this.#locations;
    }
    /**
     * Reads, filters, and associate the records of the publication file
     * @param filePath path to PSGC publication datafile
     * @param sheet defaults to PSGC
     */
    public async read(filePath: string, sheet = DEFAULT_SHEET_NAME) {
        await this.readPublicationFile(filePath, sheet);
        this.filter().associate();

        return {
            regions: this.#regions,
            provinces: this.#provinces,
            cities: this.#cities,
            municipalities: this.#municipalities,
            subMunicipalities: this.#subMunicipalities,
            barangays: this.#barangays,
        };
    }

    /**
     * Reads, drops statistics columns, filters, and associate the records of the publication file
     * @param filePath path to PSGC publication datafile
     * @param sheet defaults to PSGC
     */
    public async readWithoutStatistics(
        filePath: string,
        sheet = DEFAULT_SHEET_NAME
    ) {
        await this.readPublicationFile(filePath, sheet);
        this.setBuilder(new BasicBuilder()).filter().associate();

        return {
            regions: this.#regions,
            provinces: this.#provinces,
            cities: this.#cities,
            municipalities: this.#municipalities,
            subMunicipalities: this.#subMunicipalities,
            barangays: this.#barangays,
        };
    }

    public reset() {
        this.#locations = [];
        this.#regions = [];
        this.#provinces = [];
        this.#cities = [];
        this.#municipalities = [];
        this.#subMunicipalities = [];
        this.#barangays = [];
    }
}
