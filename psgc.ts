import readXlsxFile from "read-excel-file/node";
import Logger from "./logger";

interface LocationRecord {
    code: string;
    name: string;
    geoLevel: string;
    class: string;
    oldCode: string;
    oldName: string;
    incomeClass: string;
    urbanRural: string;
    population: number;
    status: string;
}

const DEFAULT_SHEET_NAME = "PSGC";
const mapping = {
    "10-digit PSGC": "code",
    Name: "name",
    "Correspondence Code": "oldCode",
    "Geographic Level": "geoLevel",
    "Old names": "oldName",
    "City Class": "class",
    "Income\nClassification": "incomeClass",
    "Urban / Rural\n(based on 2020 CPH)": "urbanRural",
    "2020 Population": "population",
    "": "remarks",
    Status: "status",
};

const REGION = "Reg";
const PROVINCE = "Prov";
const CITY = "City";
const MUNICIPALITY = "Mun";
const SUB_MUNICIPALITY = "SubMun";
const BARANGAY = "Bgy";

export default class PSGC {
    static #instance: PSGC;

    logger: Logger;

    locations: LocationRecord[] = [];

    regions: LocationRecord[] = [];
    provinces: LocationRecord[] = [];
    cities: LocationRecord[] = [];
    municipalities: LocationRecord[] = [];
    subMunicipalities: LocationRecord[] = [];
    barangays: LocationRecord[] = [];

    private constructor() {}

    public static get instance(): PSGC {
        if (!PSGC.#instance) {
            PSGC.#instance = new PSGC();
            PSGC.#instance.logger = new Logger();
        }

        return PSGC.#instance;
    }

    public enableLogger() {
        this.logger.setEnabled(true);
        return this;
    }

    public disableLogger() {
        this.logger.setEnabled(false);
        return this;
    }

    public async readExcel(filePath: string, sheetName = DEFAULT_SHEET_NAME) {
        try {
            this.logger.info(`Start reading: ${filePath}`);

            const sheet = await readXlsxFile<LocationRecord>(filePath, {
                sheet: sheetName,
                map: mapping,
            });

            this.locations = sheet.rows as LocationRecord[];

            this.logger.info("Read complete");

            return this;
        } catch (error) {
            this.logger.error(error);
        }
    }

    filterGeoLevel() {
        this.logger.info("Start filtering by geographic level");

        this.locations.forEach((location) => {
            switch (location.geoLevel) {
                case REGION:
                    this.regions.push(location);
                    break;
                case PROVINCE:
                    this.provinces.push(location);
                    break;
                case CITY:
                    this.cities.push(location);
                    break;
                case MUNICIPALITY:
                    this.municipalities.push(location);
                    break;
                case SUB_MUNICIPALITY:
                    this.subMunicipalities.push(location);
                    break;
                case BARANGAY:
                    this.barangays.push(location);
                    break;
                default:
                    // Some records does not have geo level
                    this.logger.info("Missing geographic level:", location);

                    // We'll determine the geo level using it's code
                    location.code = String(location.code);

                    // Is region level
                    if (location.code.endsWith("00000000")) {
                        this.regions.push(location);
                    }
                    // Is province level
                    else if (location.code.endsWith("00000")) {
                        this.provinces.push(location);
                    }
                    // Is city level
                    else if (location.code.endsWith("000")) {
                        this.cities.push(location);
                    }
                    // Is barangay level
                    else {
                        this.barangays.push(location);
                    }
                    break;
            }
        });

        this.logger.info("Filter completed");
        return this;
    }

    clearLocations() {
        this.locations = [];
    }
}
