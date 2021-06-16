import { cellTypeEnum } from "../Enums/cell-type.enum";
import { colInterface } from "./col.interface";

export interface colActionIterface {
    type: string,
    //Loading phase
    columns?: colInterface [],
    // name of target col
    column?: string,
    // reconciliator
    reconciliator: string,
    colType: cellTypeEnum,
    extendedCol: string,
}