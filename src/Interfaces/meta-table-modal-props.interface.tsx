import { colInterface } from "./col.interface";

export interface metaTableModalPropsInterface {
    titleText: string,
    metaData: any[],
    dataIndex: number,
    col: colInterface,
    mainButtonLabel?: string,
    secondaryButtonLabel?: string,
    secondaryButtonAction?: Function,
    showState: boolean,
    onClose: Function,
}