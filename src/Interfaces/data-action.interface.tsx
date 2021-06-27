import { metaResponseInterface } from "./meta-response.interface";

export interface dataActionInterface {
    type: string,
    data?: any[],
    //used to modify a single col
    index?: number,
    line?: any,
    colName?: string,
    metadata?: any[],
    reconciliator?: string,
    responseMeta?: metaResponseInterface,
}