import PSGC from "./src/psgc";

const getRegions = async () => {
    const filePath = "./data/PSGC-April-2024-Publication-Datafile.xlsx";

    const psgc = PSGC.instance;

    psgc.enableLogger();

    await psgc.readExcel(filePath);

    psgc.filterGeoLevel().associateLocations();
    // .toSingleJsonFile("./data/test.json");

    console.log(psgc.tables.regions);
};

getRegions();
