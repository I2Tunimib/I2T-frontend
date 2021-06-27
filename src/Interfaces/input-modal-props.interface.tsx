export interface inputModalPropsInterface {
    inputLabel: string, 
    titleText: string, 
    text?: string, 
    value: string | number | undefined,
    mainButtonLabel: string,
    mainButtonAction: Function,
    secondaryButtonLabel: string,
    secondaryButtonAction: Function,
    showState: boolean,
    onClose: Function,
    setInputValue: Function,
}