import   {ReactComponent as SelectIcon} from "../Assets/icon-set/selected/select.svg";
import  {ReactComponent as DeselectIcon} from "../Assets/icon-set/selected/select-empty.svg";
import  {ReactComponent as DeleteIcon} from "../Assets/icon-set/delete/trash.svg";

import {ReactComponent as EditIcon} from "../Assets/icon-set/edit/pencil.svg";
import {ReactComponent as ExtendIcon} from "../Assets/icon-set/extend/extend.svg";
import {ReactComponent as MetaIcon} from "../Assets/icon-set/metadata/tag.svg";
import {ReactComponent as RiconciliateIcon} from "../Assets/icon-set/riconciliate/link.svg";
import { colInterface } from "../Interfaces/col.interface";
import { contextInterface } from "../Interfaces/context.interface";
import { contextItemInterface } from "../Interfaces/context-items.interface";

export const selectContext = (col:colInterface, selectCol: Function, deselectCol: Function, removeContext: Function): contextItemInterface => {
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


export const deleteContext = (col: colInterface, deleteCol: Function, removeContext: Function) => {
    return ({
        icon: <DeleteIcon/>,
        label: "Elimina colonna",
        action: ()=> {
            deleteCol(col.name);
            removeContext();
        }
    })
}
    

export const editContext = (dataIndex: number, keyName: string, editableCell: Function, removeContext: Function) => {
    return ({
        icon: <EditIcon/>,
        label: "Modifica label",
        action: () => {
            editableCell(dataIndex, keyName);
            removeContext();
        }
    })
}

export const extContext = (dataIndex: number, extendRow: Function, removeContext: Function) => {
    return ({
        icon: <ExtendIcon/>,
        label: "Estendi riga",
        action: () => {
            extendRow(dataIndex);
            removeContext();
        }
    })
}

export const deleteLineContext = (index: number, deleteRow: Function, removeContext: Function) => {
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

export const seeMetaDataContext = (openModal: Function, removeContext: Function) => {
    return ({
        icon: <MetaIcon/>,
        label: "Modifica sorgente metadati",
        action: () => {
            openModal(true);
            removeContext()
        }
    })
}


export const riconciliateContext = (reconciliate: Function, payload: any, removeContext: Function) => {
    return({
        icon: <RiconciliateIcon/>,
        label: 'Riconcilia Cella',
        action: () => {
            reconciliate([payload])
            removeContext();
        }
    })
}

export const extendColMetaContext = (col: colInterface, dispatchExtendColMeta: Function, removeContext: Function, dispatchAddExtMetaCol: Function) => {
    return ({
            icon: <ExtendIcon/>,
            label: "Estendi colonna con metadati",
            action: () => {
                dispatchExtendColMeta(col.name, col.reconciliator); // this is broken
                dispatchAddExtMetaCol(`${col.name} (${col.reconciliator})`, "METAID", col.name);
                removeContext();
            }
    })
}

export const viewMetaTable = (openModal: Function, removeContext: Function) => {
    return ({
        icon: <MetaIcon/>,
        label: "Visualizza metadati",
        action: () => {
            openModal(true);
            removeContext();
        }
    })
}
