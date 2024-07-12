// import fs from "fs";
import { Tables } from "./types/tables";

export interface Converter {
    convert(tables: Tables, path: string);
}

export class JsonSingleConvert implements Converter {
    convert(tables: Tables, path: string) {
        const regions: any = [];

        tables.regions.forEach((region) => {
            const provinces: any = [];
            region.provinces.forEach((province) => {
                // json.regions[regionIndex];
            });

            regions.push({
                code: region.code,
                name: region.name,
                provinces: [],
            });
        });

        // const jsonString = JSON.stringify(json);
        // fs.writeFile(path, jsonString, function (err) {
        //     if (err) {
        //         console.log(err);
        //     }
        // });
    }
}
