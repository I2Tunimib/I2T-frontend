export const addToExtendCols = (colsInfo) => {
    return{
        type: "SETTOEXTENDCOL",
        colsInfo
    }
}

export const removeAllToExtendCols = () => {
    return {
        type: "DELETETOEXTENDCOL",
    }
}