const extendRowReducer = (state = false, action) => {
    switch(action.type) {
        case "EXTENDROW":
            return state = action.rowIndex;
        case "ROWHASBEENEXTENDED":
            return state = false;
        default:
            return state;
    }
}
export default extendRowReducer;