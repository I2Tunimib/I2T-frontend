import { cellTypeEnum } from "@enums/cell-type.enum";
import { SaveFormat } from "@utils/saver/types";
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

export const convertFromAppData = (savedData: SaveFormat) => {
    // convert headers to columns array of objects
    const headersUI = savedData.application.ui[0];
    const headersData = savedData.data[0];
    
    let columns = Object.keys(headersUI).map((key, index) => {
        return {
            ...headersUI[key], 
            ...headersData[key],
            type: cellTypeEnum.data
        } as colInterface;
    });

    columns = [
        addIndexColumn(),
        ...columns
    ]

    // convert data to table rows

    // get rows excluding header and add data type
    const rows = savedData.data.slice(1);

    let table: any = [];
    rows.forEach(row => {
        const a = Object.keys(row).reduce((acc, key) => {
            return {
                ...acc,
                [key]: {...row[key], type: cellTypeEnum.data}
            }
        }, {})
        table = [...table, a];
    })

    return [columns, table];
}