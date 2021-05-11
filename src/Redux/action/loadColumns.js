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