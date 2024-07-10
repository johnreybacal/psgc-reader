import PSGC from "./psgc";

const getRegions = async () => {
    const filePath = "./PSGC-April-2024-Publication-Datafile.xlsx";

    const psgc = PSGC.instance;

    psgc.enableLogger();

    await psgc.readExcel(filePath);

    psgc.filterGeoLevel().associateIntoTables();

    console.log(psgc.tables.regions);

    console.log(psgc.tables.provinces);
};

getRegions();
