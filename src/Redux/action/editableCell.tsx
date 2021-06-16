import { editableCellActionInterface } from "../../Interfaces/editable-cell-action.interface"

export const addEditableCell = (rowIndex: number, keyName: string): editableCellActionInterface => {
    return {
        type: "ADDEDITABLE",
        rowIndex,
        keyName,
    }
}

export const removeEditableCell = (): editableCellActionInterface => {
    return {
        type: "REMOVEEDITABLE",
    }
}