import readXlsxFile from "read-excel-file/node";
import Logger from "./logger";
import { FilteredPSGC, PSGCRecord, Tables } from "./types";

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
    private _tables: Tables;

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

        this._locations.forEach((location) => {
            switch (location.geoLevel) {
                case REGION:
                    this._filteredPSGC.regions.push(location);
                    break;
                case PROVINCE:
                    this._filteredPSGC.provinces.push(location);
                    break;
                case CITY:
                    this._filteredPSGC.cities.push(location);
                    break;
                case MUNICIPALITY:
                    this._filteredPSGC.municipalities.push(location);
                    break;
                case SUB_MUNICIPALITY:
                    this._filteredPSGC.subMunicipalities.push(location);
                    break;
                case BARANGAY:
                    this._filteredPSGC.barangays.push(location);
                    break;
                default:
                    // Some records does not have geo level
                    this._logger.info("Missing geographic level:", location);

                    // We'll determine the geo level using it's code
                    location.code = String(location.code);

                    // Is region level
                    if (location.code.endsWith("00000000")) {
                        this._filteredPSGC.regions.push(location);
                    }
                    // Is province level
                    else if (location.code.endsWith("00000")) {
                        this._filteredPSGC.provinces.push(location);
                    }
                    // Is city level
                    else if (location.code.endsWith("000")) {
                        this._filteredPSGC.cities.push(location);
                    }
                    // Is barangay level
                    else {
                        this._filteredPSGC.barangays.push(location);
                    }
                    break;
            }
        });

        this._logger.info("Filter completed");
        return this;
    }

    public clearLocations() {
        this._locations = [];
    }
}
