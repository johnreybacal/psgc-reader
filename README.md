# psgc-reader

A package for ingesting PSGC publication files

## How to use

### 1. Import the package

```typescript
import PsgcReader from "psgc-reader";

// We only need one instance of the object
const psgc = PsgcReader.instance;
```

### 2. Read

-   supply the publication file to `filePath`
    -   You can get publication files here: https://psa.gov.ph/classification/psgc
-   `sheetName` has default value set to "PSGC"
-   Records will be stored in `locations`

```typescript
await psgc.read(filePath, sheetName);

console.log(psgc.locations);
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
psgc.filter();

console.log(psgc.filteredPSGC);
console.log(psgc.regions);
console.log(psgc.provinces);
console.log(psgc.cities);
console.log(psgc.municipalities);
console.log(psgc.subMunicipalities);
console.log(psgc.barangays);
```

### 4. Associate

This will link `regions`, `provinces`, `cities`, `municipalities`, `subMunicipalities`, and `barangays`

```typescript
psgc.associate();
```

### 5. Explore

```typescript
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
```
