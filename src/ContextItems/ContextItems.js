import   {ReactComponent as SelectIcon} from "../Assets/icon-set/selected/select.svg";
import  {ReactComponent as DeselectIcon} from "../Assets/icon-set/selected/select-empty.svg";
import  {ReactComponent as DeleteIcon} from "../Assets/icon-set/delete/trash.svg";
import {ReactComponent as EditIcon} from "../Assets/icon-set/edit/pencil.svg";
import {ReactComponent as ExtendIcon} from "../Assets/icon-set/extend/extend.svg";
import {ReactComponent as MetaIcon} from "../Assets/icon-set/metadata/tag.svg";
import {ReactComponent as RiconciliateIcon} from "../Assets/icon-set/riconciliate/link.svg";
export const selectContext = (col, selectCol, deselectCol, removeContext) => {
    let selectLabel = "";
    if (col.selected) {
        selectLabel = "Deseleziona colonna";
    } else {
        selectLabel = "Seleziona colonna";
    }
    return ({
        icon: col.selected ? <DeselectIcon/> : <SelectIcon/>,
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
        icon: <DeleteIcon/>,
        label: "Elimina colonna",
        action: ()=> {
            deleteCol(col.name);
            removeContext();
        }
    })
}
    

export const editContext = (dataIndex, keyName, editableCell, removeContext) => {
    return ({
        icon: <EditIcon/>,
        label: "Modifica label",
        action: () => {
            editableCell(dataIndex, keyName);
            removeContext();
        }
    })
}

export const extContext = (dataIndex, extendRow, removeContext) => {
    return ({
        icon: <ExtendIcon/>,
        label: "Estendi riga",
        action: () => {
            extendRow(dataIndex);
            removeContext();
        }
    })
}

export const deleteLineContext = (index, deleteRow, removeContext) => {
    return ({
        icon: <DeleteIcon/>,
        label: "Elimina riga",
        action: () => {
            console.log(index);
            deleteRow(index);
            removeContext();
        }
    })
}

export const seeMetaDataContext = (openModal, removeContext) => {
    return ({
        icon: <MetaIcon/>,
        label: "Vedi sorgente metadati",
        action: () => {
            openModal(true);
            removeContext()
        }
    })
}


export const riconciliateContext = (reconciliate, payload, removeContext) => {
    return({
        icon: <RiconciliateIcon/>,
        label: 'Riconcilia Cella',
        action: () => {
            reconciliate([payload])
            removeContext();
        }
    })
}