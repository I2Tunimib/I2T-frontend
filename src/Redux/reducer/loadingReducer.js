const loadingReducer = (state = false, action) => {
    switch (action.type) {
        case "LOADING":
            return state = true;
        case "NOT LOADING":
            return state = false;
        default:
            return state = false;
    }
}

export default loadingReducer;