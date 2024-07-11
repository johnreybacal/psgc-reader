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
    static _instance: PSGC;

    private _logger: Logger;

    private _locations: PSGCRecord[] = [];
    private _filteredPSGC: FilteredPSGC = new FilteredPSGC();
    private _tables: Tables = new Tables();

    private constructor() {}

    public static get instance(): PSGC {
        if (!PSGC._instance) {
            PSGC._instance = new PSGC();
            PSGC._instance._logger = new Logger();
        }

        return PSGC._instance;
    }

    public get locations() {
        return this._locations;
    }
    public get filteredPSGC() {
        return this._filteredPSGC;
    }
    public get tables() {
        return this._tables;
    }

    public enableLogger() {
        this._logger.setEnabled(true);
        return this;
    }

    public disableLogger() {
        this._logger.setEnabled(false);
        return this;
    }

    public async readExcel(filePath: string, sheetName = DEFAULT_SHEET_NAME) {
        try {
            this._logger.info(`Start reading: ${filePath}`);

            const sheet = await readXlsxFile<PSGCRecord>(filePath, {
                sheet: sheetName,
                map: mapping,
            });

            this._locations = sheet.rows as PSGCRecord[];

            this._logger.info("Read complete");

            return this;
        } catch (error) {
            this._logger.error(error);
        }
    }

    public filterGeoLevel() {
        this._logger.info("Start filtering by geographic level");

        const psgc = this._filteredPSGC;
        this._locations.forEach((location) => {
            switch (location.geoLevel) {
                case REGION:
                    psgc.regions.push(location);
                    break;
                case PROVINCE:
                    psgc.provinces.push(location);
                    break;
                case CITY:
                    psgc.cities.push(location);
                    break;
                case MUNICIPALITY:
                    psgc.municipalities.push(location);
                    break;
                case SUB_MUNICIPALITY:
                    psgc.subMunicipalities.push(location);
                    break;
                case BARANGAY:
                    psgc.barangays.push(location);
                    break;
                default:
                    // Some records does not have geo level
                    this._logger.info("Missing geographic level:", location);

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

        this._logger.info("Filter completed");
        return this;
    }

    public associateIntoTables() {
        this._logger.info("Start associating PSGC to tables");
        const psgc = this._filteredPSGC;

        this._logger.info("Regions...");
        psgc.regions.forEach((location) => {
            const region = new Region();
            region.code = location.code;
            region.name = location.name;

            this._tables.regions.push(region);
        });

        this._logger.info("Provinces...");
        psgc.provinces.forEach((location) => {
            const province = new Province();
            province.code = location.code;
            province.name = location.name;

            province.setJurisdictionCode();

            this._tables.provinces.push(province);
        });

        this._logger.info("Cities:");
        this._logger.info("\tCity...");
        psgc.cities.forEach((location) => {
            const city = new City();
            city.code = location.code;
            city.name = location.name;
            city.type = location.geoLevel;
            city.cityClass = location.class;

            city.setJurisdictionCode();

            this._tables.cities.push(city);
        });

        this._logger.info("\tMunicipality...");
        psgc.municipalities.forEach((location) => {
            const municipality = new City();
            municipality.name = location.name;
            municipality.code = location.code;

            municipality.setJurisdictionCode();

            this._tables.cities.push(municipality);
        });

        this._logger.info("\tSub-Municipality...");
        psgc.subMunicipalities.forEach((location) => {
            const subMunicipality = new City();
            subMunicipality.name = location.name;
            subMunicipality.code = location.code;

            subMunicipality.setJurisdictionCode();

            this._tables.cities.push(subMunicipality);
        });

        this._logger.info("Barangays...");
        psgc.barangays.forEach((location) => {
            const barangay = new Barangay();
            barangay.name = location.name;
            barangay.code = location.code;

            barangay.setJurisdictionCode();

            this._tables.barangays.push(barangay);
        });

        this._logger.info("Association completed");
    }

    public clearLocations() {
        this._locations = [];
    }
}
