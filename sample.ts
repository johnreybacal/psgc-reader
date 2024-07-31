import psgcReader from "./src";

const test = async () => {
    const filePath = "./data/PSGC-April-2024-Publication-Datafile.xlsx";

    // const psgc = PsgcReader.instance;
    // psgc.enableLogger();
    // await psgc.readPublicationFile(filePath);
    // psgc.setBuilder(new BasicBuilder()).filter().associate();
    const psgc = await psgcReader.read(filePath);

    console.log("[Regions]");
    psgc.regions.map((region) => console.log(" >", region.name));

    console.log("[SubMunicipalities under Manila]");
    psgc.cities
        .filter((city) => city.code === "1380600000")[0]
        .subMunicipalities?.map((subMunicipality) =>
            console.log(" >", subMunicipality.name)
        );

    // https://stackoverflow.com/a/66523350
    const barangayCountByName = psgc.barangays.reduce((barangay, { name }) => {
        barangay[name] = barangay[name] || 0;
        barangay[name] += 1;

        return barangay;
    }, {});

    // https://stackoverflow.com/a/1069840
    const barangayCountByNameSorted: any[] = [];
    for (let name in barangayCountByName) {
        barangayCountByNameSorted.push([name, barangayCountByName[name]]);
    }
    barangayCountByNameSorted.sort(function (a, b) {
        return b[1] - a[1];
    });

    console.log("[Top 10 barangay names]");
    console.log(barangayCountByNameSorted.slice(0, 10));
};

const saveJson = async () => {
    const filePath = "./test/ncr_car_data.xlsx";
    const destinationPath = "./data/sample.json";

    await psgcReader.readToJson(filePath, destinationPath);

    process.exit(0);
};

// test();
saveJson();
