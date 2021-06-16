export interface classicModalPropsInterface {
    titleText?: string,
    text?: string, 
    mainButtonLabel?: string, 
    mainButtonAction?: Function,
    secondaryButtonLabel?: string,
    secondaryButtonAction?: Function, 
    showState: boolean,
    onClose: Function,
    metadataModal?: boolean,
}