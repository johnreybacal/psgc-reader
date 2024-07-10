import PSGC from "./psgc";

const getRegions = async () => {
    const filePath = "./PSGC-April-2024-Publication-Datafile.xlsx";

    const psgc = PSGC.instance;

    // psgc.enableLogger();

    await psgc.readExcel(filePath);

    psgc.filterGeoLevel();

    console.log(psgc.regions);

    console.log(
        psgc.provinces.filter((location) =>
            location.code.toString().startsWith("01")
        )
    );
};

getRegions();
