import { StandardSaverFormat } from "@utils/saver/types";
import { colInterface } from "../../../../Interfaces/col.interface";


export const standardSaver = (headers: colInterface[], rows: any): StandardSaverFormat => {
    // prepare header data
    const headersToSave = headers.filter(header => header.name !== 'index').reduce((acc, header, index) => {
        // deconstruct data of the ui, from rest of data
        const { name, selected, type, reconciliated, reconciliator, new: newCol, ...rest } = header;
        // construct ui data object
        const ui = {
            [`th${index}`]: {
                name,
                selected: false,
                // type,
                reconciliated,
                reconciliator,
                new: false
            }
        }
        // construct data object with rest of the fields
        const data = {
            [`th${index}`]: rest
        }
        return {
            ui: {...acc.ui, ...ui},
            data: {...acc.data, ...data}
        }
    }, { ui: [] as any, data: [] as any })

    // prepeare rows data
    const rowsToSave = rows.filter((row: any) => row.name !== 'index').reduce((acc: any, row: any, index: number) => {

        let rowUI = {};
        let rowData = {}

        Object.keys(row).forEach(key => {
            // deconstruct data of the ui, from rest of data of a row
            const { type, ...rest } = row[key];

            // construct ui data object
            // at the moment cells do not have data about the UI to keep track
            // add here otherwise
            // const uiTmp = {...}

            // construct data object with rest of the fields
            const dataTmp = {
                [key]: rest
            }
            // rowUI = {...rowUI, ...uiTmp};
            rowData = {...rowData, ...dataTmp};
        });

        return {
            ui: [...acc.ui, rowUI],
            data: [...acc.data, rowData]
        }
    }, { ui: [] as any, data: [] as any })

    const result = {
        ui: [headersToSave.ui],
        data: [headersToSave.data, ...rowsToSave.data]
    };
    
    return result;
}