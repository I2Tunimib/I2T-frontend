export const loadDataSuccess = (data) => {
    return {
        type: "LOADED",
        data,
    }
}
export const deleteData = () => {
    return{
        type:"CANCELDATA"
    }
}

export const updateLine = (index, line) => {
    return {
        type:"UPDATELINE",
        index,
        line
    }
}

export const deleteLine = (index) => {
    return {
        type: "DELETELINE",
        index,
    }
}

export const loadSavedDataSuccess = (data) => {
    return {
        type: "LOADSAVED",
        data,
    }
}

export const addMetadata = (colName, index, metadata) => {
    return {
         type: "ADDMETA",
         colName, 
         index, 
         metadata,
    }

}

export const extendColMeta = (colName, reconciliator) => {
    console.log(colName, reconciliator);
    return {
        type: "EXTENDMETA",
        colName,
        reconciliator,
    }
}