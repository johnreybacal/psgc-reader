import PSGC from "./psgc";

const getRegions = async () => {
    const filePath = "./PSGC-April-2024-Publication-Datafile.xlsx";

    await PSGC.instance.readExcel(filePath);

    const regions = PSGC.instance.filterGeoLevel().regions;

    console.log(regions);
};

getRegions();
