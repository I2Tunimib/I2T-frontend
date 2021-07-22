import { colInterface } from "../../Interfaces/col.interface"

export const loadColumns = (columns: colInterface[]) => {
    return {
        type: "LOADCOLUMNS",
        columns,
    }
}

export const selectColumn = (columnToSelect: string) => {
    return {
        type: "SELECTCOL",
        column: columnToSelect,
    }
}

export const deselectColumn = (columnToDeselect: string) => {
    return {
        type: "DESELECTCOL",
        column:  columnToDeselect,
    }
}

export const deleteColumn = (columnToDelete: string) => {
    return {
        type: "DELETECOL",
        column: columnToDelete,
    }
}

export const deleteAllColumns = () => {
    return {
        type: "DELETEALLCOLS"   
    }
}

export const reconciliatedCol = (column: string, reconciliator: string) => {
    return {
        type: "RECONCILIATECOL",
        column,
        reconciliator
    }
}

export const addExtMetaCol = (extendedCol:string, isExtended: boolean ) => {
    return {
        type: "ADDEXTMETACOL",
        extendedCol,
        isExtended,
    }
}

export const filterCol = (filter: string | null, column: string) => {
    return {
        type: "ADDFILTER",
        filter,
        column
    }
}

export const removeFilter = () => {
    return {
        type: "REMOVEFILTER",
    }
}

export const addMetaColumn = (meta: any, column: string) => {
    return {
        type: 'ADDMETACOLUMN',
        meta, 
        column
    }
} 