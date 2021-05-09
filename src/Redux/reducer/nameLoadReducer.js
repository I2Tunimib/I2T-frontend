const nameLoadReducer = (state = "", action ) => {
    switch(action.type) {
        case "LOADNAME":
            return state = action.name;
        default: 
            return state = state;
    }
}
export default nameLoadReducer;