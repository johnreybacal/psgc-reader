# psgc-reader

A package for ingesting PSGC publication files

## Quickstart

```typescript
import PsgcReader from "psgc-reader";

const result = await PsgcReader.instance.read(filePath);
// result contains regions, provinces, cities, municipalities, subMunicipalities, and barangays that are associated with each other

// if statistics columns are not needed
const resultWithoutStatistics = await PsgcReader.instance.readWithoutStatistics(
    filePath
);
```

Or, just the raw data

```typescript
import PsgcReader from "psgc-reader";

const result = await PsgcReader.instance.readRaw(filePath);
// result is an array
```

## Or do it step by step

### 1. Import the package

```typescript
import PsgcReader from "psgc-reader";

// We only need one instance of the object
const psgcReader = PsgcReader.instance;
```

### 2. Read

-   supply the publication file to `filePath`
    -   You can get publication files here: https://psa.gov.ph/classification/psgc
-   `sheetName` has default value set to "PSGC"
-   Records will be stored in `locations`

```typescript
await psgcReader.readPublicationFile(filePath, sheetName);

console.log(psgcReader.locations);
```

#### 2.1 Before filtering, select a builder

```typescript
import PsgcReader, { BasicBuilder, CompleteBuilder } from "psgc-reader";

// The BasicBuilder will omit statistical fields
psgcReader.setBuilder(new BasicBuilder());

// Default builder: includes all fields
psgcReader.setBuilder(new CompleteBuilder());
```

### 3. Filter

-   `filteredPSGC` is just filtered `locations`
-   `regions`
-   `provinces`
-   `cities`
-   `municipalities`
-   `subMunicipalities`
-   `barangays`

```typescript
psgcReader.filter();

console.log(psgcReader.filteredPSGC);
console.log(psgcReader.regions);
console.log(psgcReader.provinces);
console.log(psgcReader.cities);
console.log(psgcReader.municipalities);
console.log(psgcReader.subMunicipalities);
console.log(psgcReader.barangays);
```

### 4. Associate

This will link `regions`, `provinces`, `cities`, `municipalities`, `subMunicipalities`, and `barangays`

```typescript
psgcReader.associate();
```

### 5. Explore

```typescript
console.log("[Regions]");
psgcReader.regions.map((region) => console.log(" >", region.name));

console.log("[SubMunicipalities under Manila]");
psgcReader.cities
    .filter((city) => city.code === "1380600000")[0]
    .subMunicipalities?.map((subMunicipality) =>
        console.log(" >", subMunicipality.name)
    );

// https://stackoverflow.com/a/66523350
const barangayCountByName = psgcReader.barangays.reduce(
    (barangay, { name }) => {
        barangay[name] = barangay[name] || 0;
        barangay[name] += 1;

        return barangay;
    },
    {}
);

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
```
