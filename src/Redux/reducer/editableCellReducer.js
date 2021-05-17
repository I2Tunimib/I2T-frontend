const editableCellReducer = (state = null, action) => {
    switch(action.type) {
        case "ADDEDITABLE":
            return state = {
                rowIndex: action.rowIndex,
                keyName: action.keyName
            }
        case "REMOVEEDITABLE":
            return state = null;
        default:
            return state;
    }
}

export default editableCellReducer;