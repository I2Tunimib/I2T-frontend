const contextReducer = (state = null, action) => {
    switch(action.type) {
        case "ADDCONTEXT":
            return state = action.context;
        case "REMOVECONTEXT":
            return state = null;
        default:
            return state;
    }
}
export default contextReducer;