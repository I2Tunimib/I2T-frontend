import { CsvSeparator } from "./csv-separator.enum";

export const convertFromCSV = (data: any, separator: CsvSeparator = CsvSeparator.COMMA) => {
    // deconstruct header from rows
    const [header, ...rows] = data.split("\r\n");
    // get header labels as array
    const headerValues = header.split(separator);

    // construct array of json objects object
    let converted: any[] = [];
    
    // construct rows
    rows.forEach((row: string) => {
        const rowValues = row.split(separator);

        let obj = {}
        headerValues.forEach((label: string, index: number) => {
            obj = {...obj, [label]: rowValues[index]};
        });
        converted = [...converted, obj];
    });
    return converted;
}