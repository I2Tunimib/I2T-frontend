export const addEditableCell = (rowIndex, keyName) => {
    return {
        type: "ADDEDITABLE",
        rowIndex,
        keyName,
    }
}

export const removeEditableCell = () => {
    return {
        type: "REMOVEEDITABLE",
    }
}