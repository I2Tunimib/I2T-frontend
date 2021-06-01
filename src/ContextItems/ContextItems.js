import { removeContext } from "../Redux/action/openContext";
import {ReactComponent as SelectIcon} from "../Assets/icon-set/selected/select.svg";
import {ReactComponent as DeselectIcon} from "../Assets/icon-set/selected/select-empty.svg";
import {ReactComponent as DeleteIcon} from "../Assets/icon-set/delete/trash.svg";
import {ReactComponent as EditIcon} from "../Assets/icon-set/edit/pencil.svg";

export const selectContext = (col, selectCol, deselectCol, removeContext) => {
    let selectLabel = "";
    if (col.selected) {
        selectLabel = "Deseleziona";
    } else {
        selectLabel = "Seleziona";
    }
    return ({
        icon: col.selected ? DeselectIcon : SelectIcon,
        label: selectLabel,
        action: () => {
            if (col.selected) {
                deselectCol(col.name);
            } else {
                
                selectCol(col.name);
            }
            removeContext();
        }
    })
}


export const deleteContext = (col, deleteCol, removeContext) => {
    return ({
        icon: DeleteIcon,
        label: "Elimina",
        action: ()=> {
            deleteCol(col.name);
            removeContext();
        }
    })
}
    

export const editContext = (dataIndex, keyName, editableCell, removeContext) => {
    return ({
        icon: EditIcon,
        label: "Modifica",
        action: () => {
            editableCell(dataIndex, keyName);
            removeContext();
        }
    })
}

export const extContext = (dataIndex, extendRow, removeContext) => {
    return ({
        icon: null,
        label: "Estendi riga",
        action: () => {
            extendRow(dataIndex);
            removeContext();
        }
    })
}

export const deleteLineContext = (index, deleteRow, removeContext) => {
    return ({
        icon: DeleteIcon,
        label: "Elimina riga",
        action: () => {
            deleteRow(index);
            removeContext();
        }
    })
}