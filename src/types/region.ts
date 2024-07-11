import Province from "./province";

export default class Region {
    code: string;
    name: string;
    provinces: Province[] = [];
}
