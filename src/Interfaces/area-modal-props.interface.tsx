import { StringMappingType } from "typescript";

export interface areaModalPropsInterface {
    inputLabel: string, 
    titleText: string, 
    text: string, 
    value: string,
    mainButtonLabel?: string,
    mainButtonAction?: Function,
    secondaryButtonLabel?: string,
    secondaryButtonAction?: Function,
    showState: boolean,
    onClose: Function,
    setInputValue: Function,
}