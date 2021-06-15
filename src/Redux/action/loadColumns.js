export const loadColumns = (columns) => {
    return {
        type: "LOADCOLUMNS",
        columns,
    }
}

export const selectColumn = (columnToSelect) => {
    return {
        type: "SELECTCOL",
        column: columnToSelect,
    }
}

export const deselectColumn = (columnToDeselect) => {
    return {
        type: "DESELECTCOL",
        column:  columnToDeselect,
    }
}

export const deleteColumn = (columnToDelete) => {
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

export const reconciliatedCol = (column, reconciliator) => {
    return {
        type: "RECONCILIATECOL",
        column,
        reconciliator
    }
}

export const addExtMetaCol = (name, colType, extendedCol ) => {
    return {
        type: "ADDEXTMETACOL",
        name,
        colType,
        extendedCol,
    }
}
