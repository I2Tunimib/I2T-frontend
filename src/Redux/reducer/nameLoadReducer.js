const nameLoadReducer = (state = "", action ) => {
    switch(action.type) {
        case "LOADNAME":
            return state = action.name;
        case "DELETENAME":
            return state = "";
        default: 
            return state = state;
    }
}
export default nameLoadReducer;