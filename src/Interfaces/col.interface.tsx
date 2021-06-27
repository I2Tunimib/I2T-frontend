import { cellTypeEnum } from "../Enums/cell-type.enum";

export interface colInterface {
    label: string,
    name: string,
    selected: boolean,
    type: cellTypeEnum,
    reconciliated: boolean,
    reconciliator: string,
    new: boolean, 
    extendedMeta?: boolean,
    filtered?: string | null,
}