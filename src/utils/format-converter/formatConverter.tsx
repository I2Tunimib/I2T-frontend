import { convertFromCSV, convertFromAppData, convertFromJSON } from "./converters";

export const convert = (format: string, data: any) => {
    switch (format) {
        case "csv":
            return convertFromCSV(data);
        case "app-data":
            return convertFromAppData(data);
        case "json":
            return convertFromJSON(data);
        case "ssv":
            const lines = data.toString().split("\n");

            const result = [];

            const headers = lines[0].split(";");

            for (let i = 1; i < lines.length; i++) {

                const obj: any = {};
                const currentline = lines[i].split(";"); //possibilità di scegliere separatore

                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j];
                }

                result.push(obj);

            }
            return result;
        default:
            return convertFromCSV(data);
    }
}