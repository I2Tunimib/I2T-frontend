const loadColumnsReducer = (state = [], action) => {
    switch(action.type) {
        case "LOADCOLUMNS":
            return state = action.columns
        default :
            return state;
    }
}

export default loadColumnsReducer;