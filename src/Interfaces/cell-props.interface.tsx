import { colInterface } from "./col.interface";

export interface cellPropsInterface {
    dataIndex: number,
    col: colInterface,
    rowsPerPage?: number,
    pageIndex?: number, 
    rowIndex?: number,
    keyName?: string,
}