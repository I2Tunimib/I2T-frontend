const hasExtendedReducer = (state = false, action) => {
    switch(action.type) {
        case "EXTENDED":
            return state = true;
        case "NOTEXTENDED":
            return state = false;
        default: 
            return state;
    }
}

export default hasExtendedReducer;