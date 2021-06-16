export interface metaTableModalPropsInterface {
    titleText: string,
    metaData: any[],
    dataIndex: number,
    colName: string,
    mainButtonLabel?: string,
    secondaryButtonLabel?: string,
    secondaryButtonAction?: Function,
    showState: boolean,
    onClose: Function,
}