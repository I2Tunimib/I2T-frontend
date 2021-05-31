import { removeContext } from "../Redux/action/openContext";

export const selectContext = (col, selectCol, deselectCol, removeContext) => {

    let selectLabel = ""
    if (col.selected) {
        selectLabel = "Deseleziona";
    } else {
        selectLabel = "Seleziona";
    }
    return ({
        icon: "",
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
        icon: "",
        label: "Elimina",
        action: ()=> {
            deleteCol(col.name);
            removeContext();
        }
    })
}
    

export const editContext = (dataIndex, keyName, editableCell, removeContext) => {
    return ({
        icon: "",
        label: "Modifica",
        action: () => {
            editableCell(dataIndex, keyName);
            removeContext();
        }
    })
}

export const extContext = (dataIndex, extendRow, removeContext) => {
    return ({
        icon: "",
        label: "Estendi riga",
        action: () => {
            extendRow(dataIndex);
            removeContext();
        }
    })
}

export const deleteLineContext = (index, deleteRow, removeContext) => {
    return ({
        icon: "",
        label: "Elimina riga",
        action: () => {
            deleteRow(index);
            removeContext();
        }
    })
}