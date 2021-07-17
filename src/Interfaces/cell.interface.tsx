import { cellTypeEnum } from "../Enums/cell-type.enum";

export interface cellInterface{
    type: cellTypeEnum,
    label: string,
    metadata: any[],
    ids?: string[],
    reconciliator: string,
}