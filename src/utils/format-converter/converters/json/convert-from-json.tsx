import { cellTypeEnum } from "@enums/cell-type.enum";
import { colInterface } from "src/Interfaces/col.interface";

const addIndexColumn = (): colInterface => {
    return {
        label: '0',
        name: 'index',
        selected: false,
        type: cellTypeEnum.index,
        reconciliated: false,
        reconciliator: '',
        new: false,
        metadata: []
    }
}

export const convertFromJSON = (data: any) => {
    // parse json
    data = JSON.parse(data);

    // convert headers to columns array of objects
    const headers = data[0];
    let columns = Object.keys(headers).map((key, index): any => {
        return {
            ...headers[key],
            name: key,
            selected: false,
            reconciliated: false,
            reconciliator: '',
            new: false,
            type: cellTypeEnum.data
        } as colInterface;
    });

    // add index column
    columns = [
        addIndexColumn(),
        ...columns
    ];

    // get rows excluding header
    const table = data.slice(1);

    return [columns, table];
}