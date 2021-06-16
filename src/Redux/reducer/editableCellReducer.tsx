import { editableCellActionInterface } from "../../Interfaces/editable-cell-action.interface";
import { editableCellInterface } from "../../Interfaces/editable-cell.interface";

const editableCellReducer = (state: editableCellInterface | null = null, action: editableCellActionInterface) => {
    switch(action.type) {
        case "ADDEDITABLE":
            return state = {
                rowIndex: action.rowIndex!,
                keyName: action.keyName!
            }
        case "REMOVEEDITABLE":
            return state = null;
        default:
            return state;
    }
}

export default editableCellReducer;