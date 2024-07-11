import readXlsxFile from "read-excel-file/node";
import Logger from "./logger";
import Barangay from "./types/barangay";
import City from "./types/city";
import Province from "./types/province";
import { FilteredPSGC, PSGCRecord } from "./types/psgc";
import Region from "./types/region";
import { Tables } from "./types/tables";

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

    public async readExcel(filePath: string, sheetName = DEFAULT_SHEET_NAME) {
        try {
            this.#logger.info(`Start reading: ${filePath}`);

            const sheet = await readXlsxFile<PSGCRecord>(filePath, {
                sheet: sheetName,
                map: mapping,
            });

            this.#locations = sheet.rows as PSGCRecord[];

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
