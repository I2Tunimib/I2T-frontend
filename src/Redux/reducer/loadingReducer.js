const loadingReducer = (state = false, action) => {
    switch (action.type) {
        case "LOADING":
            console.log("setto loading");
            return state = true;
        case "NOT LOADING":
            console.log("setto not loading");
            return state = false;
        default:
            return state;
    }
}

export default loadingReducer;