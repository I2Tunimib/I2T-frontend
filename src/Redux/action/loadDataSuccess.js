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