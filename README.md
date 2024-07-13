# psgc-reader

A package for ingesting PSGC publication files

## How to use

### 1. Import the package

```typescript
import PSGC from "psgc";

// We only need one instance of the object
const psgc = PSGC.instance;
```

### 2. Read

-   supply the path to `filePath`
-   `sheetName` has default value set to "PSGC"
-   Records will be stored in `locations`

```typescript
await psgc.readExcel(filePath, sheetName);

console.log(psgc.locations);
```

### 3. Filter

-   `filteredPSGC` is just filtered `locations`
-   `tables` contain location data that we can associate to each other

```typescript
psgc.filterGeoLevel();

console.log(psgc.filteredPSGC);
console.log(psgc.tables);
```

### 4. Associate

This will link all the locations in the `tables` property

```typescript
psgc.associateLocations();
```

### 5. Explore

```typescript
console.log("[Regions]");
psgc.tables.regions.map((region) => console.log(" >", region.name));

console.log("[SubMunicipalities under Manila]");
psgc.tables.cities
    .filter((city) => city.code === "1380600000")[0]
    .subMunicipalities?.map((subMunicipality) =>
        console.log(" >", subMunicipality.name)
    );

// https://stackoverflow.com/a/66523350
const barangayCountByName = psgc.tables.barangays.reduce(
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
