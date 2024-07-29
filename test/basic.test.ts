import { beforeEach, describe, expect, test } from "@jest/globals";

import * as path from "path";
import psgcReader from "../src";

const filePath = path.resolve(__dirname, "ncr_car_data.xlsx");

beforeEach(() => {
    psgcReader.reset();
});

describe("basic test", () => {
    test("read", async () => {
        const result = await psgcReader.read(filePath);

        expect(result).toBeDefined();

        expect(result.regions.length).toBe(2);
        expect(result.provinces.length).toBe(6);
        expect(result.cities.length).toBe(18);
        expect(result.municipalities.length).toBe(76);
        expect(result.subMunicipalities.length).toBe(14);
        expect(result.barangays.length).toBe(2888);

        // NCR
        const ncrCode = "13";
        const ncr = result.regions.filter((region) =>
            region.code.startsWith(ncrCode)
        )[0];

        expect(ncr).toBeDefined();
        expect(ncr.population).toBe(13484462);
        expect(ncr.oldCode).toBe("130000000");
        expect(ncr.provinces.length).toBe(0);
        expect(ncr.cities.length).not.toBe(0);
        expect(ncr.municipalities.length).not.toBe(0);
    });
    test("readWithoutStatistics", async () => {
        const result = await psgcReader.readWithoutStatistics(filePath);

        expect(result).toBeDefined();

        for (const province of result.provinces) {
            expect(province.incomeClassification).toBeUndefined();
            expect(province.population).toBeUndefined();
        }
        for (const barangay of result.barangays) {
            expect(barangay.urbanRuralClassification).toBeUndefined();
            expect(barangay.population).toBeUndefined();
        }
    });
});
