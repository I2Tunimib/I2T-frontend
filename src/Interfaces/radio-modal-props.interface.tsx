export interface radioModalPropsInterface {
    inputLabel: string,
    titleText: string, 
    text: string, 
    mainButtonLabel: string, 
    mainButtonAction: Function, 
    secondaryButtonAction: Function,
    secondaryButtonLabel: string,
    showState: boolean,
    onClose: Function, 
    inputArray: {label: string, value: string}[],
    setInputValue: Function,
}