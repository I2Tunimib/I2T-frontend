
export const loadDataSuccessReducer = (state = [], action) => {
    switch(action.type) {
        case "LOADED":
            return state = action.data;
        case "CANCELDATA":
            return state = [];
        default:
            return state;
    }
}