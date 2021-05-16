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

export const popToExtendCol = (indexToPop) => {
    return {
        type: "POPTOEXTENDCOL",
        indexToPop
    }
}