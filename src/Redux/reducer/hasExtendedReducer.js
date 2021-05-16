const hasExtendedReducer = (state = false, action) => {
    switch(action.type) {
        case "EXTENDED":
            return state = true;
        case "NOTEXTENDED":
            return state = false;
        case "EXTENDING":
            return state = "Extending...";
        default: 
            return state;
    }
}

export default hasExtendedReducer;