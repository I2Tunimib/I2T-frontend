export const addToExtendRows = (colsInfo) => {
    return{
        type: "SETTOEXTENDCOL",
        colsInfo
    }
}

export const removeAllToExtendRows = () => {
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