import   {ReactComponent as SelectIcon} from "../Assets/icon-set/selected/select.svg";
import  {ReactComponent as DeselectIcon} from "../Assets/icon-set/selected/select-empty.svg";
import  {ReactComponent as DeleteIcon} from "../Assets/icon-set/delete/trash.svg";
import {ReactComponent as FilterIcon} from "../Assets/icon-set/filter/filter.svg";
import {ReactComponent as EditIcon} from "../Assets/icon-set/edit/pencil.svg";
import {ReactComponent as ExtendIcon} from "../Assets/icon-set/extend/extend.svg";
import {ReactComponent as MetaIcon} from "../Assets/icon-set/metadata/tag.svg";
import {ReactComponent as RiconciliateIcon} from "../Assets/icon-set/riconciliate/link.svg";
import { colInterface } from "../Interfaces/col.interface";
import { contextItemInterface } from "../Interfaces/context-items.interface";


export const selectContext = (col:colInterface, selectCol: Function, deselectCol: Function, removeContext: Function, t: any): contextItemInterface => {
    let selectLabel = "";
    if (col.selected) {
        selectLabel = t('context-items.deselect-column')
    } else {
        selectLabel = t('context-items.select-column');
    }
    return ({
        icon: col.selected ? <DeselectIcon className='stroke'/> : <SelectIcon className='stroke'/>,
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


export const deleteContext = (col: colInterface, deleteCol: Function, removeContext: Function, t: any) => {
    return ({
        icon: <DeleteIcon/>,
        label: t('context-items.delete-column'),
        action: ()=> {
            deleteCol(col.name);
            removeContext();
        }
    })
}
    

export const editContext = (dataIndex: number, keyName: string, editCell: Function, removeContext: Function, t: any) => {
    return ({
        icon: <EditIcon/>,
        label: t('context-items.edit-label'),
        action: () => {
            editCell(true);
            removeContext();
        }
    })
}


export const deleteLineContext = (index: number, deleteRow: Function, removeContext: Function, t: any) => {
    return ({
        icon: <DeleteIcon/>,
        label: t('context-items.delete-line'),
        action: () => {
            deleteRow(index);
            removeContext();
        }
    })
}


export const riconciliateContext = (reconciliate: Function, payload: any, removeContext: Function, t:any) => {
    return({
        icon: <RiconciliateIcon/>,
        label: t('context-items.reconcile-cell'),
        action: () => {
            reconciliate([payload])
            removeContext();
        }
    })
}

export const extendColMetaContext = (col: colInterface, dispatchExtendColMeta: Function, removeContext: Function, dispatchAddExtMetaCol: Function, t: any) => {
    const wantToExtend = col.extendedMeta ? false : true;
    return ({
            icon: <ExtendIcon/>,
            label: wantToExtend ? t('context-items.expand-entities'): t('context-items.collapse-entities'),
            action: () => {
                dispatchExtendColMeta(col.name, col.reconciliator); 
                dispatchAddExtMetaCol(col.name, wantToExtend);
                removeContext();
            }
    })
}

export const viewMetaTable = (openModal: Function, removeContext: Function, t: any) => {
    return ({
        icon: <MetaIcon/>,
        label: t('context-items.show-metadata'),
        action: () => {
            openModal(true);
            removeContext();
        }
    })
}

export const openFilterDialog = (col: colInterface, setFilterDialogIsOpen: Function,dispatchRemoveFilters: Function, removeContext: Function, t: any) => {
    return ({
        icon: <FilterIcon/>,
        label: col.filtered ? t('context-items.remove-filters') : t('context-items.filter-column'),
        action: !col.filtered ? () => {
            setFilterDialogIsOpen(true);
            removeContext();
        } : () => {
            dispatchRemoveFilters();
            removeContext();
        }
    })
}

export const openAutoMatchingDialog = (openAutoDialog: Function, removeContext: Function, t: any) => {
    return ({
        icon: <MetaIcon/>,
        label: t('context-items.finalize-matching'),
        action: () => {
            openAutoDialog(true);
            removeContext();
        }
    })
}
